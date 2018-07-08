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

import { join } from 'path';
import { series } from 'async';
import { getDoNotDisturb, getSessionState } from 'electron-notification-state';
import { CB, IContact } from './common/types';
import { INotificationArguments } from './common/arguments';
import { dataSource, setWeeklyQueue, setLastContactedDate } from './db';
import * as moment from 'moment-timezone';
import { BrowserWindow, screen } from 'electron';
import { handleInternalError } from './util';

let notificationWindow: BrowserWindow | null;
let doNotDisturbEnabled = false;

type State = 'queued' | 'snoozing';
let state: State = 'queued';

const NOTIFICATION_WIDTH = 310;
const NOTIFICATION_HEIGHT = 150;

const NOTIFICATION_DURATION = 5000;

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const MIN_MONTHLY_GAP = DAY_IN_MS * 25;
const MONTHLY_GAP_SCALING_FACTOR = 0.1 / DAY_IN_MS;
const MIN_QUARTERLY_GAP = DAY_IN_MS * 80;
const QUARTERLY_GAP_SCALING_FACTOR = 0.05 / DAY_IN_MS;

const MAX_WEEKLY_CONTACTS = 10;

const TICK_INTERVAL = 1000 * 60 * 15;

export function respond(cb: CB): void {
  const contactQueue = [ ...dataSource.getQueue().contactQueue ];
  const currentContact = contactQueue.shift();
  if (currentContact) {
    console.log(`Responded to ${currentContact.name}`);
    series([
      (next) => setLastContactedDate(currentContact, Date.now(), next),
      (next) => setWeeklyQueue(contactQueue, next)
    ], cb);
  } else {
    handleInternalError('Respond called with an empty queue');
    setImmediate(cb);
  }
  setState('queued');
}

export function pushToBack(cb: CB): void {
  const contactQueue = [ ...dataSource.getQueue().contactQueue ];
  const currentContact = contactQueue.shift();
  if (currentContact) {
    contactQueue.push(currentContact);
    setWeeklyQueue(contactQueue, cb);
  } else {
    setImmediate(cb);
  }
}

export function closeNotification(): void {
  setState('snoozing');
  if (notificationWindow) {
    notificationWindow.close();
  }
}

export function enableDoNotDisturb(): void {
  console.log('Enabling Do Not Disturb mode');
  doNotDisturbEnabled = true;
}

export function disableDoNotDisturb(): void {
  console.log('Disabling Do Not Disturb mode');
  doNotDisturbEnabled = false;
}

export function init(cb: CB): void {
  setTimeout(tick, 5000);
  refreshQueue(cb);
}

function setState(newState: State): void {
  console.log(`Setting scheduler state to ${newState}`);
  state = newState;
}

function tick() {
  const sessionState = getSessionState();
  if (doNotDisturbEnabled || getDoNotDisturb() ||
    sessionState === 'QUNS_BUSY' || sessionState === 'QUNS_PRESENTATION_MODE'
  ) {
    console.log('Skipping notification tick because Do Not Disturb is enabled in the app or OS');
  } else {
    switch (state) {
      case 'queued':
        showNotification();
        break;
      case 'snoozing':
        showNotification();
        break;
    }
  }
  setTimeout(tick, TICK_INTERVAL);
}

function refreshQueue(cb: CB): void {
  const queue = dataSource.getQueue();
  const lastUpdated = moment(queue.lastUpdated);
  if (lastUpdated.isAfter(moment().startOf('week'))) {
    setImmediate(cb);
    return;
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

  console.log(`Scheduling ${newContactQueue.length} contacts out of ${weights.length} possible contacts`);
  setWeeklyQueue(newContactQueue, cb);
}

function showNotification() {
  const args: INotificationArguments = {
    contact: dataSource.getQueue().contactQueue[0]
  };
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
  notificationWindow.loadFile(join(__dirname, '..', 'renderer', 'notification.html'));
}
