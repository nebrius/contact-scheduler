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

import { existsSync } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
import { app } from 'electron';
import { verbose, Database } from 'sqlite3';
import { ICalendar, IContact } from './common/types';
import { createInternalError, log } from './util';

const CALENDARS_TABLE_NAME = 'calendars';
const CONTACTS_TABLE_NAME = 'contacts';
const SCHEDULE_TABLE_NAME = 'schedule';

console.log(app);
const dbPath = join(app.getPath('userData'), 'contact-scheduler-db.sqlite3');
let db: Database;

const CALENDAR_SCHEMA =
`CREATE TABLE ${CALENDARS_TABLE_NAME}(
  id INTEGER PRIMARY KEY,
  displayName text NOT NULL,
  source text NOT NULL
)`;

const CONTACT_SCHEMA =
`CREATE TABLE ${CONTACTS_TABLE_NAME}(
  id INTEGER PRIMARY KEY,
  name text NOT NULL,
  frequency text NOT NULL,
  lastContacted INTEGER NOT NULL
)`;

const SCHEDULE_SCHEMA =
`CREATE TABLE ${SCHEDULE_TABLE_NAME}(
  id INTEGER PRIMARY KEY,
  queue text NOT NULL,
  lastUpdated INTEGER NOT NULL
)`;

interface IRawQueue {
  id: number;
  queue: string;
  lastUpdated: number;
}

interface IQueue {
  contactQueue: IContact[];
  lastUpdated: number;
}

let calendars: ICalendar[] = [];
let contacts: IContact[] = [];
let queue: IQueue = {
  contactQueue: [],
  lastUpdated: 0
};

class DataSource extends EventEmitter {
  public getCalendars() {
    return [ ...calendars ];
  }
  public getContacts() {
    return [ ...contacts ];
  }
  public getQueue() {
    return { ...queue };
  }
}

async function dbRun(query: string, parameters?: Array<string | number | undefined>): Promise<void> {
  if (!db) {
    throw createInternalError(`dbRun called before database initialized`);
  }
  return new Promise((resolve, reject) => {
    db.run(query, parameters || [], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function dbAll(query: string, parameters: string[]): Promise<any[]> {
  if (!db) {
    throw createInternalError(`dbRun called before database initialized`);
  }
  return new Promise((resolve, reject) => {
    db.all(query, parameters, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function dbGet(query: string, parameters: string[]): Promise<any> {
  if (!db) {
    throw createInternalError(`dbRun called before database initialized`);
  }
  return new Promise((resolve, reject) => {
    db.get(query, parameters, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export const dataSource = new DataSource();

export async function init(): Promise<void> {
  const isNewDB = !existsSync(dbPath);
  const sqlite3 = verbose();
  log(`Loading database from ${dbPath}`);

  // Can't use promisify here cause it barfs on constructors, aparently
  db = await new Promise((resolve, reject) => new sqlite3.Database(dbPath, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  }));
  if (isNewDB) {
    log(`New database detected, initializing`);
    await dbRun(CALENDAR_SCHEMA);
    await dbRun(CONTACT_SCHEMA);
    await dbRun(SCHEDULE_SCHEMA),
    await dbRun(`INSERT INTO ${SCHEDULE_TABLE_NAME}(queue, lastUpdated) VALUES(?, 0)`, [ '[]' ]);
  }
  await refreshContacts();
  await refreshCalendars();
  await refreshQueue();
}

// Calendar methods

async function refreshCalendars(): Promise<void> {
  calendars = await dbAll(`SELECT * FROM ${CALENDARS_TABLE_NAME}`, []);
  dataSource.emit('calendarsUpdated', calendars);
}

export async function createCalendar(calendar: ICalendar): Promise<void> {
  dbRun(`INSERT INTO ${CALENDARS_TABLE_NAME}(displayName, source) VALUES(?, ?)`,
    [ calendar.displayName, calendar.source ]);
  await refreshCalendars();
}

export async function updateCalendar(calendar: ICalendar): Promise<void> {
  dbRun(`UPDATE ${CALENDARS_TABLE_NAME} SET displayName = ?, source = ? WHERE id = ?`,
    [ calendar.displayName, calendar.source, calendar.id ]);
  await refreshCalendars();
}

export async function deleteCalendar(calendar: ICalendar): Promise<void> {
  dbRun(`DELETE FROM ${CALENDARS_TABLE_NAME} WHERE id = ?`, [ calendar.id ]);
  await refreshCalendars();
}

// Contact methods

async function refreshContacts(): Promise<void> {
  contacts = await dbAll(`SELECT * FROM ${CONTACTS_TABLE_NAME}`, []);
  dataSource.emit('contactsUpdated', contacts);
}

export async function createContact(contact: IContact): Promise<void> {
  await dbRun(`INSERT INTO ${CONTACTS_TABLE_NAME}(name, frequency, lastContacted) VALUES(?, ?, 0)`,
    [ contact.name, contact.frequency ]);
  await refreshContacts();
}

export async function updateContact(contact: IContact): Promise<void> {
  dbRun(`UPDATE ${CONTACTS_TABLE_NAME} SET name = ?, frequency = ? WHERE id = ?`,
    [ contact.name, contact.frequency, contact.id ]);
  await refreshContacts();
}

export async function setLastContactedDate(contact: IContact, lastContactedDate: number): Promise<void> {
  dbRun(`UPDATE ${CONTACTS_TABLE_NAME} SET lastContacted = ? WHERE id = ?`,
    [ lastContactedDate, contact.id ]);
  await refreshContacts();
}

export async function deleteContact(contact: IContact): Promise<void> {
  // TODO: delete from queue if they're in there
  dbRun(`DELETE FROM ${CONTACTS_TABLE_NAME} WHERE id = ?`, [ contact.id ]);
  await refreshContacts();
}

// Queue methods

async function refreshQueue(): Promise<void> {
  const result: IRawQueue = await dbGet(`SELECT * FROM ${SCHEDULE_TABLE_NAME}`, []);
  const ids = JSON.parse(result.queue);
  const contactQueue: IContact[] = ids.map((id: number) => {
    for (const contact of contacts) {
      if (contact.id === id) {
        return contact;
      }
    }
    throw createInternalError(`Could not locate contact with id ${id}`);
  }).filter((contact: IContact | null) => !!contact);
  queue = {
    contactQueue,
    lastUpdated: result.lastUpdated
  };
  dataSource.emit('queueUpdated', queue);
}

export async function setWeeklyQueue(contactQueue: IContact[]): Promise<void> {
  const ids = JSON.stringify(contactQueue.map((contact) => contact.id));
  await dbRun(`UPDATE ${SCHEDULE_TABLE_NAME} SET queue = ?, lastUpdated = ?`, [ ids, Date.now() ]);
  await refreshQueue();
}
