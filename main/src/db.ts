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
import { series, waterfall } from 'async';
import { verbose, Database } from 'sqlite3';
import { ICalendar, IContact, CB } from './common/types';
import { handleInternalError, log } from './util';

const CALENDARS_TABLE_NAME = 'calendars';
const CONTACTS_TABLE_NAME = 'contacts';
const SCHEDULE_TABLE_NAME = 'schedule';

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

export const dataSource = new DataSource();

export function init(cb: CB): void {
  const isNewDB = !existsSync(dbPath);
  const sqlite3 = verbose();
  log(`Loading database from ${dbPath}`);
  waterfall([
    (next: (err: Error | null) => void) => (db = new sqlite3.Database(dbPath, next)),
    (next: CB) => {
      if (!isNewDB) {
        next(undefined);
        return;
      }
      log(`New database detected, initializing`);
      // Need to slice off extra params so can't pass cb or next directly here
      series([
        (nextInit) => db.run(CALENDAR_SCHEMA, (err?: Error) => nextInit(err)),
        (nextInit) => db.run(CONTACT_SCHEMA, (err?: Error) => nextInit(err)),
        (nextInit) => db.run(SCHEDULE_SCHEMA, (err?: Error) => nextInit(err)),
        (nextInit) => db.run(`INSERT INTO ${SCHEDULE_TABLE_NAME}(queue, lastUpdated) VALUES(?, 0)`, [ '[]' ],
          (err?: Error) => nextInit(err))
      ], (err?: Error) => next(err));
    },
    (next: CB) => refreshContacts(next),
    (next: CB) => refreshCalendars(next),
    (next: CB) => refreshQueue(next)
  ], cb);
}

function refreshCalendars(cb: CB): void {
  waterfall([
    (next: CB) =>  db.all(`SELECT * FROM ${CALENDARS_TABLE_NAME}`, [], next),
    (newCalendars: ICalendar[], next: CB) => {
      calendars = newCalendars;
      dataSource.emit('calendarsUpdated', calendars);
      next(undefined);
    }
  ], cb);
}

export function createCalendar(calendar: ICalendar, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`INSERT INTO ${CALENDARS_TABLE_NAME}(displayName, source) VALUES(?, ?)`,
      [ calendar.displayName, calendar.source ], next),
    (next: CB) => refreshCalendars(next)
  ], cb);
}

export function updateCalendar(calendar: ICalendar, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`UPDATE ${CALENDARS_TABLE_NAME} SET displayName = ?, source = ? WHERE id = ?`,
      [ calendar.displayName, calendar.source, calendar.id ], next),
    (next: CB) => refreshCalendars(next)
  ], cb);
}

export function deleteCalendar(calendar: ICalendar, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`DELETE FROM ${CALENDARS_TABLE_NAME} WHERE id = ?`,
      [ calendar.id ], next),
    (next: CB) => refreshCalendars(next)
  ], cb);
}

function refreshContacts(cb: CB): void {
  waterfall([
    (next: CB) => db.all(`SELECT * FROM ${CONTACTS_TABLE_NAME}`, [], next),
    (newContacts: IContact[], next: CB) => {
      contacts = newContacts;
      dataSource.emit('contactsUpdated', contacts);
      next(undefined);
    }
  ], cb);
}

export function createContact(contact: IContact, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`INSERT INTO ${CONTACTS_TABLE_NAME}(name, frequency, lastContacted) VALUES(?, ?, 0)`,
      [ contact.name, contact.frequency ], next),
    (next: CB) => refreshContacts(next)
  ], cb);
}

export function updateContact(contact: IContact, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`UPDATE ${CONTACTS_TABLE_NAME} SET name = ?, frequency = ? WHERE id = ?`,
      [ contact.name, contact.frequency, contact.id ], next),
    (next: CB) => refreshContacts(next)
  ], cb);
}

export function setLastContactedDate(contact: IContact, lastContactedDate: number, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`UPDATE ${CONTACTS_TABLE_NAME} SET lastContacted = ? WHERE id = ?`,
      [ lastContactedDate, contact.id ], next),
    (next: CB) => refreshContacts(next)
  ], cb);
}

export function deleteContact(contact: IContact, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`DELETE FROM ${CONTACTS_TABLE_NAME} WHERE id = ?`,
      [ contact.id ], next),
    (next: CB) => refreshContacts(next)
  ], cb);
}

function refreshQueue(cb: CB): void {
  waterfall([
    (next: CB) => db.get(`SELECT * FROM ${SCHEDULE_TABLE_NAME}`, [], next),
    (result: IRawQueue, next: CB) => {
      const ids = JSON.parse(result.queue);
      const contactQueue: IContact[] = ids.map((id: number) => {
        for (const contact of contacts) {
          if (contact.id === id) {
            return contact;
          }
        }
        next(handleInternalError(`Could not locate contact with id ${id}`));
        return null;
      }).filter((contact: IContact | null) => !!contact);
      queue = {
        contactQueue,
        lastUpdated: result.lastUpdated
      };
      dataSource.emit('queueUpdated', queue);
      next(undefined);
    }
  ], cb);
}

export function setWeeklyQueue(contactQueue: IContact[], cb: CB): void {
  const ids = JSON.stringify(contactQueue.map((contact) => contact.id));
  waterfall([
    (next: CB) => db.run(`UPDATE ${SCHEDULE_TABLE_NAME} SET queue = ?, lastUpdated = ?`, [ ids, Date.now() ], next),
    (next: CB) => refreshQueue(next)
  ], cb);
}
