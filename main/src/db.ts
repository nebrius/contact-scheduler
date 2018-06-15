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
import { ICalendar, IContact, CB, CBWithResult } from './common/types';

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
  contactOrder INTEGER NOT NULL,
  contactId INTEGER NOT NULL
)`;

let calendars: ICalendar[] = [];
let contacts: IContact[] = [];

class DataSource extends EventEmitter {
  public getCalendars() {
    return [ ...calendars ];
  }
  public getContacts() {
    return [ ...contacts ];
  }
}

export const dataSource = new DataSource();

export function init(cb: CB): void {
  const isNewDB = !existsSync(dbPath);
  const sqlite3 = verbose();
  db = new sqlite3.Database(dbPath, (connectErr) => {
    if (connectErr) {
      cb(connectErr);
      return;
    }
    if (isNewDB) {
      // Need to slice off extra params so can't pass cb or next directly here
      series([
        (next) => db.run(CALENDAR_SCHEMA, (err?: Error) => next(err)),
        (next) => db.run(CONTACT_SCHEMA, (err?: Error) => next(err)),
        (next) => db.run(SCHEDULE_SCHEMA, (err?: Error) => next(err))
      ], (err?: Error) => cb(err));
    } else {
      cb(undefined);
    }
  });
}

export function getCalendars(cb: CBWithResult<ICalendar[]>): void {
  db.all(`SELECT * FROM ${CALENDARS_TABLE_NAME}`, [], cb);
}

export function createCalendar(calendar: ICalendar, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`INSERT INTO ${CALENDARS_TABLE_NAME}(displayName, source) VALUES(?, ?)`,
      [ calendar.displayName, calendar.source ], next),
    (next: CB) => getCalendars(next),
    (newCalendars: ICalendar[], next: CB) => {
      calendars = newCalendars;
      dataSource.emit('calendarsUpdated', calendars);
      next(undefined);
    }
  ], cb);
}

export function updateCalendar(calendar: ICalendar, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`UPDATE ${CALENDARS_TABLE_NAME} SET displayName = ?, source = ? WHERE id = ?`,
      [ calendar.displayName, calendar.source, calendar.id ], next),
    (next: CB) => getCalendars(next),
    (newCalendars: ICalendar[], next: CB) => {
      calendars = newCalendars;
      dataSource.emit('calendarsUpdated', calendars);
      next(undefined);
    }
  ], cb);
}

export function deleteCalendar(calendar: ICalendar, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`DELETE FROM ${CALENDARS_TABLE_NAME} WHERE id = ?`,
      [ calendar.id ], next),
    (next: CB) => getCalendars(next),
    (newCalendars: ICalendar[], next: CB) => {
      calendars = newCalendars;
      dataSource.emit('calendarsUpdated', calendars);
      next(undefined);
    }
  ], cb);
}

export function getContacts(cb: CBWithResult<IContact[]>): void {
  db.all(`SELECT * FROM ${CONTACTS_TABLE_NAME}`, [], cb);
}

export function createContact(contact: IContact, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`INSERT INTO ${CONTACTS_TABLE_NAME}(name, frequency, lastContacted) VALUES(?, ?, 0)`,
      [ contact.name, contact.frequency ], next),
    (next: CB) => getContacts(next),
    (newContacts: IContact[], next: CB) => {
      contacts = newContacts;
      dataSource.emit('contactsUpdated', contacts);
      next(undefined);
    }
  ], cb);
}

export function updateContact(contact: IContact, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`UPDATE ${CONTACTS_TABLE_NAME} SET name = ?, frequency = ? WHERE id = ?`,
      [ contact.name, contact.frequency, contact.id ], next),
    (next: CB) => getContacts(next),
    (newContacts: IContact[], next: CB) => {
      contacts = newContacts;
      dataSource.emit('contactsUpdated', contacts);
      next(undefined);
    }
  ], cb);
}

export function deleteContact(contact: IContact, cb: CB): void {
  waterfall([
    (next: CB) => db.run(`DELETE FROM ${CONTACTS_TABLE_NAME} WHERE id = ?`,
      [ contact.id ], next),
    (next: CB) => getContacts(next),
    (newContacts: IContact[], next: CB) => {
      contacts = newContacts;
      dataSource.emit('contactsUpdated', contacts);
      next(undefined);
    }
  ], cb);
}
