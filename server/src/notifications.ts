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

import { parallel, series } from 'async';
import { setVapidDetails, sendNotification } from 'web-push';
import { getEnvironmentVariable } from './util';
import { CB, IDailyBucket, IUser, IContact, Frequency } from './common/types';
import { getStartOfToday, getStartOfWeek } from './util';
import { getUser, getUsers, setDailyBuckets, setWeeklyContactList } from './db';

const HOUR_IN_MS = 60 * 60 * 1000;
const BUCKET_DURATION = HOUR_IN_MS;
const MONTHLY_THRESHOLD = HOUR_IN_MS * 24 * 25;
const QUARTERLY_THRESHOLD = HOUR_IN_MS * 24 * 80;

export function init(cb: CB): void {
  setVapidDetails(
    'mailto:bryan@nebri.us',
    getEnvironmentVariable('PUSH_PUBLIC_KEY'),
    getEnvironmentVariable('PUSH_PRIVATE_KEY')
  );
  console.log('Notifications initialied');
  setImmediate(cb);
}

function ensureWeeklyContactList(user: IUser, cb: CB): void {
  const midnight = getStartOfToday(user.settings.timezone);
  if (user.state.weeklyContactListUpdated > getStartOfWeek(user.settings.timezone)) {
    cb(undefined);
    return;
  }
  console.log('Creating the list of people to contact');
  const peopleToContact: IContact[] = [];
  for (const contact of user.contacts) {
    switch (contact.frequency) {
      case Frequency.Weekly:
        peopleToContact.push(contact);
        break;
      case Frequency.Monthly:
        if (contact.lastContacted + MONTHLY_THRESHOLD < midnight) {
          peopleToContact.push(contact);
        }
        break;
      case Frequency.Quarterly:
        if (contact.lastContacted + QUARTERLY_THRESHOLD < midnight) {
          peopleToContact.push(contact);
        }
        break;
    }
  }
  const shuffledPeopleToContact: IContact[] = [];
  while (peopleToContact.length) {
    const i = Math.round(Math.random() * (peopleToContact.length - 1));
    shuffledPeopleToContact.push(peopleToContact.splice(i, 1)[0]);
  }
  setWeeklyContactList(user.id, shuffledPeopleToContact, cb);
}

function ensureDailyBuckets(user: IUser, cb: CB): void {
  const midnight = getStartOfToday(user.settings.timezone);
  if (user.state.dailyBucketsUpdated >= midnight) {
    cb(undefined);
    return;
  }
  console.log('Creating the daily buckets');
  const startOfToday = midnight + user.settings.startOfDay * HOUR_IN_MS;
  const endOfToday = midnight + user.settings.endOfDay * HOUR_IN_MS;
  const buckets: IDailyBucket[] = [];
  for (let timestamp = startOfToday; timestamp < endOfToday; timestamp += BUCKET_DURATION) {
    buckets.push({
      timestamp,
      available: true // TODO: hook in calendar information
    });
  }
  setDailyBuckets(user.id, buckets, cb);
}

function processNextNotification(user: IUser, cb: CB): void {
  if (!user.state.weeklyContactList.length) {
    console.log(`No more contacts to process this week, go ${user.name}!`);
    cb(undefined);
    return;
  }
  for (const bucket of user.state.dailyBuckets) {
    if (bucket.timestamp <= Date.now() && Date.now() < bucket.timestamp + BUCKET_DURATION) {
      if (bucket.available) {
        const nextContact = user.state.weeklyContactList[0];
        if (nextContact && user.state.subscription) {
          console.log(`Time for ${user.name} to reach out to ${nextContact.name}`);
          sendNotification(user.state.subscription, JSON.stringify(nextContact))
            .then(() => cb(undefined))
            .catch(cb);
          return;
        }
      }
    }
  }
  cb(undefined);
}

export function processNotifications(cb: CB): void {
  parallel(getUsers().map((user) => (next: CB) => {
    // const dayOfWeek = (new Date(midnight)).getDay();
    // if (dayOfWeek === 0 || dayOfWeek === 6) {
    //   console.log('skipping due to the weekend');
    //   next(undefined);
    //   return;
    // }
    series([
      (nextStep) => ensureWeeklyContactList(user, nextStep),
      (nextStep) => ensureDailyBuckets(user, nextStep),
      (nextStep) => processNextNotification(user, nextStep)
    ], next);
  }), cb);
}

export function rescheduleCurrentNotification(userId: string, cb: CB): void {
  const weeklyContacts = getUser(userId).state.weeklyContactList;
  const contact = weeklyContacts.shift();
  if (!contact) {
    throw new Error(`Internal Error: weekly contacts list is empty for user ${userId}`);
  }
  weeklyContacts.push(contact);
  setWeeklyContactList(userId, weeklyContacts, cb);
}

export function respondToCurrentNotification(userId: string, cb: CB): void {
  const weeklyContacts = getUser(userId).state.weeklyContactList;
  const contact = weeklyContacts.shift();
  if (!contact) {
    throw new Error(`Internal Error: weekly contacts list is empty for user ${userId}`);
  }
  setWeeklyContactList(userId, weeklyContacts, cb);
}
