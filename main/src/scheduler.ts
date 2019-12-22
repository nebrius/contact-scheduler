/*
Copyright (C) 2018 Bryan Hughes <bryan@nebri.us>

Contact Schedular is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Contact Schedular is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Contact Schedular.  If not, see <http://www.gnu.org/licenses/>.
*/

import { IContact } from './common/types';
import { INotificationArguments } from './common/arguments';
import { dataSource, setWeeklyQueue, setLastContactedDate } from './db';
import * as moment from 'moment-timezone';
import { BrowserWindow, screen } from 'electron';
import { createInternalError, log, INTERNAL_SERVER_PORT } from './util';

// TODO: These settings should be made configurable by the user eventually
const TIME_BUCKET_INTERVAL = 1000 * 60 * 15;
const NOTIFICATION_DURATION = 15000;
const MAX_WEEKLY_CONTACTS = 10;
const START_OF_AVAILABILITY = 10;
const END_OF_AVAILABILITY = 17;

interface ITimeBucket {
  start: number;
  available: boolean;
}
let timeBuckets: ITimeBucket[] = [];

let notificationWindow: BrowserWindow | null;
let doNotDisturbEnabled = false;

const NOTIFICATION_WIDTH = 310;
const NOTIFICATION_HEIGHT = 150;

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const MIN_MONTHLY_GAP = DAY_IN_MS * 25;
const MONTHLY_GAP_SCALING_FACTOR = 0.1 / DAY_IN_MS;
const MIN_QUARTERLY_GAP = DAY_IN_MS * 80;
const QUARTERLY_GAP_SCALING_FACTOR = 0.05 / DAY_IN_MS;

export async function respond(): Promise<void> {
  const contactQueue = [ ...dataSource.getQueue().contactQueue ];
  const currentContact = contactQueue.shift();
  if (currentContact) {
    log(`Responded to ${currentContact.name}`);
    await setLastContactedDate(currentContact, Date.now());
    await setWeeklyQueue(contactQueue);
  } else {
    throw createInternalError('Respond called with an empty queue');
  }
  let availableBuckets = 0;
  for (const bucket of timeBuckets) {
    if (bucket.available) {
      availableBuckets++;
    }
  }
  let numBucketsToBlock = Math.floor(availableBuckets / (2 * dataSource.getQueue().contactQueue.length));
  let i = 0;
  while (numBucketsToBlock > 0 && i < timeBuckets.length) {
    if (timeBuckets[i].available) {
      timeBuckets[i].available = false;
      numBucketsToBlock--;
    }
    i++;
  }
}

export async function pushToBack(): Promise<void> {
  const contactQueue = [ ...dataSource.getQueue().contactQueue ];
  const currentContact = contactQueue.shift();
  if (currentContact) {
    contactQueue.push(currentContact);
    await setWeeklyQueue(contactQueue);
  }
}

export function closeNotification(): void {
  if (notificationWindow) {
    notificationWindow.close();
  }
}

export function enableDoNotDisturb(): void {
  log('Enabling Do Not Disturb mode');
  doNotDisturbEnabled = true;
}

export function disableDoNotDisturb(): void {
  log('Disabling Do Not Disturb mode');
  doNotDisturbEnabled = false;
}

export async function init(): Promise<void> {
  setTimeout(tick, 5000);
  await refreshQueue();
  await refreshTimeBuckets();
}

async function tick() {
  const now = Date.now();
  // TODO: add support for system level notification state on all three platforms (but Linux first)
  if (doNotDisturbEnabled) {
    log('Skipping notification tick because Do Not Disturb is enabled in the app or OS');
  } else {
    // Get rid of expired buckets, if they exist
    while (timeBuckets.length && timeBuckets[0].start + TIME_BUCKET_INTERVAL < now) {
      timeBuckets.shift();
    }
    if (!timeBuckets.length) {
      log('Determining the week\'s schedule...');
      await refreshQueue();
      await refreshTimeBuckets();
      log('Done determing the week\'s schedule');
    } else {
      // Extra sanity-checking just in case we hit a gap in the time buckets. This *should* never happen
      if (timeBuckets.length && timeBuckets[0].start < now) {
        const currentBucket = timeBuckets.shift();
        if (currentBucket && currentBucket.available) {
          showNotification();
        } else {
          log('Nothing to do this interval because the user is not available');
        }
      } else {
        throw createInternalError('Gap in time buckets detected');
      }
    }
  }
  setTimeout(tick, TIME_BUCKET_INTERVAL);
}

async function refreshTimeBuckets(): Promise<void> {
  const endOfWeek = moment().endOf('week');
  const currentBucket = moment().startOf('hour');
  timeBuckets = [];
  while (currentBucket.isBefore(endOfWeek)) {
    const available =
      currentBucket.hour() >= START_OF_AVAILABILITY &&
      currentBucket.hour() < END_OF_AVAILABILITY &&
      currentBucket.day() > 0 &&
      currentBucket.day() < 6;
    timeBuckets.push({
      start: currentBucket.toDate().getTime(),
      available
    });
    currentBucket.add(TIME_BUCKET_INTERVAL, 'milliseconds');
  }
  return Promise.resolve();
}

async function refreshQueue(): Promise<void> {
  const queue = dataSource.getQueue();
  const lastUpdated = moment(queue.lastUpdated);
  if (lastUpdated.isAfter(moment().startOf('week'))) {
    return Promise.resolve();
  }
  const contacts = dataSource.getContacts();
  const weights: Array<{ contact: IContact; weight: number; }> = [];
  for (const contact of contacts) {
    const gap = Date.now() - contact.lastContacted;
    switch (contact.frequency) {
      case 'weekly':
        weights.push({
          contact,
          weight: 1
        });
        break;
      case 'monthly':
        if (gap > MIN_MONTHLY_GAP) {
          weights.push({
            contact,
            weight: Math.min(1, MONTHLY_GAP_SCALING_FACTOR * (gap - MIN_MONTHLY_GAP))
          });
        }
        break;
      case 'quarterly':
        if (gap > MIN_QUARTERLY_GAP) {
          weights.push({
            contact,
            weight: Math.min(1, QUARTERLY_GAP_SCALING_FACTOR * (gap - MIN_QUARTERLY_GAP))
          });
        }
        break;
    }
  }

  // Shuffle the list using the Fisher-Yates algorithm:
  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  const newContactQueue: IContact[] = weights
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_WEEKLY_CONTACTS)
    .map((weight) => weight.contact);
  for (let i = newContactQueue.length - 1; i > 0; i--) {
    const j = Math.round(Math.random() * i);
    const temp = newContactQueue[i];
    newContactQueue[i] = newContactQueue[j];
    newContactQueue[j] = temp;
  }

  log(`Scheduling ${newContactQueue.length} contacts out of ${weights.length} possible contacts`);
  await setWeeklyQueue(newContactQueue);
  await refreshTimeBuckets();
}

function showNotification() {
  const contact = dataSource.getQueue().contactQueue[0];
  if (!contact) {
    return;
  }
  const args: INotificationArguments = { contact };
  log(`Showing notification for ${args.contact.name}`);
  const { width, height } = screen.getPrimaryDisplay().size;
  notificationWindow = new BrowserWindow({
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    x: width - NOTIFICATION_WIDTH - 20,
    y: height - NOTIFICATION_HEIGHT - 20,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar : true,
    show: false,
    webPreferences: {
      additionalArguments: [ JSON.stringify(args) ]
    }
  } as any);
  notificationWindow.on('closed', () => {
    notificationWindow = null;
  });
  notificationWindow.once('ready-to-show', () => {
    if (notificationWindow) {
      notificationWindow.show();
    }
    setTimeout(() => {
      if (notificationWindow) {
        notificationWindow.close();
      }
    }, NOTIFICATION_DURATION);
  });
  notificationWindow.loadURL(`http://localhost:${INTERNAL_SERVER_PORT}/notification.html`);
}
