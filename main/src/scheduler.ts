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

import { CB, IContact } from './common/types';
import { dataSource, setWeeklyQueue } from './db';
import * as moment from 'moment-timezone';

const MAX_WEEKLY_CONTACTS = 10;
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const MIN_MONTHLY_GAP = DAY_IN_MS * 25;
const MONTHLY_GAP_SCALING_FACTOR = 0.1 / DAY_IN_MS;
const MIN_QUARTERLY_GAP = DAY_IN_MS * 80;
const QUARTERLY_GAP_SCALING_FACTOR = 0.05 / DAY_IN_MS;

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

  // Shuffle the list using the Fisher-Yates algorithm
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

export function init(cb: CB): void {
  dataSource.on('calendarsUpdated', (calendars) => {
    console.log(calendars);
  });
  dataSource.on('contactsUpdated', (contacts) => {
    console.log(contacts);
  });
  dataSource.on('queueUpdated', (queue) => {
    console.log(queue);
  });
  refreshQueue(cb);
}
