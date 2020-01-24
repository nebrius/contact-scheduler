"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const events_1 = require("events");
const electron_1 = require("electron");
const sqlite3_1 = require("sqlite3");
const util_1 = require("./util");
const CALENDARS_TABLE_NAME = 'calendars';
const CONTACTS_TABLE_NAME = 'contacts';
const SCHEDULE_TABLE_NAME = 'schedule';
let db;
const CALENDAR_SCHEMA = `CREATE TABLE ${CALENDARS_TABLE_NAME}(
  id INTEGER PRIMARY KEY,
  displayName text NOT NULL,
  source text NOT NULL
)`;
const CONTACT_SCHEMA = `CREATE TABLE ${CONTACTS_TABLE_NAME}(
  id INTEGER PRIMARY KEY,
  name text NOT NULL,
  frequency text NOT NULL,
  lastContacted INTEGER NOT NULL
)`;
const SCHEDULE_SCHEMA = `CREATE TABLE ${SCHEDULE_TABLE_NAME}(
  id INTEGER PRIMARY KEY,
  queue text NOT NULL,
  lastUpdated INTEGER NOT NULL
)`;
let calendars = [];
let contacts = [];
let queue = {
    contactQueue: [],
    lastUpdated: 0
};
class DataSource extends events_1.EventEmitter {
    getCalendars() {
        return [...calendars];
    }
    getContacts() {
        return [...contacts];
    }
    getQueue() {
        return { ...queue };
    }
}
async function dbRun(query, parameters) {
    if (!db) {
        throw util_1.createInternalError(`dbRun called before database initialized`);
    }
    return new Promise((resolve, reject) => {
        db.run(query, parameters || [], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
async function dbAll(query, parameters) {
    if (!db) {
        throw util_1.createInternalError(`dbRun called before database initialized`);
    }
    return new Promise((resolve, reject) => {
        db.all(query, parameters, (err, results) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    });
}
async function dbGet(query, parameters) {
    if (!db) {
        throw util_1.createInternalError(`dbRun called before database initialized`);
    }
    return new Promise((resolve, reject) => {
        db.get(query, parameters, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
exports.dataSource = new DataSource();
async function init() {
    const dbPath = path_1.join(electron_1.app.getPath('userData'), 'contact-scheduler-db.sqlite3');
    const isNewDB = !fs_1.existsSync(dbPath);
    const sqlite3 = sqlite3_1.verbose();
    util_1.log(`Loading database from ${dbPath}`);
    // Can't use promisify here cause it barfs on constructors, aparently
    await new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
    if (isNewDB) {
        util_1.log(`New database detected, initializing`);
        await dbRun(CALENDAR_SCHEMA);
        await dbRun(CONTACT_SCHEMA);
        await dbRun(SCHEDULE_SCHEMA),
            await dbRun(`INSERT INTO ${SCHEDULE_TABLE_NAME}(queue, lastUpdated) VALUES(?, 0)`, ['[]']);
    }
    await refreshContacts();
    await refreshCalendars();
    await refreshQueue();
}
exports.init = init;
// Calendar methods
async function refreshCalendars() {
    calendars = await dbAll(`SELECT * FROM ${CALENDARS_TABLE_NAME}`, []);
    exports.dataSource.emit('calendarsUpdated', calendars);
}
async function createCalendar(calendar) {
    await dbRun(`INSERT INTO ${CALENDARS_TABLE_NAME}(displayName, source) VALUES(?, ?)`, [calendar.displayName, calendar.source]);
    await refreshCalendars();
}
exports.createCalendar = createCalendar;
async function updateCalendar(calendar) {
    await dbRun(`UPDATE ${CALENDARS_TABLE_NAME} SET displayName = ?, source = ? WHERE id = ?`, [calendar.displayName, calendar.source, calendar.id]);
    await refreshCalendars();
}
exports.updateCalendar = updateCalendar;
async function deleteCalendar(calendar) {
    await dbRun(`DELETE FROM ${CALENDARS_TABLE_NAME} WHERE id = ?`, [calendar.id]);
    await refreshCalendars();
}
exports.deleteCalendar = deleteCalendar;
// Contact methods
async function refreshContacts() {
    contacts = await dbAll(`SELECT * FROM ${CONTACTS_TABLE_NAME}`, []);
    exports.dataSource.emit('contactsUpdated', contacts);
}
async function createContact(contact) {
    await dbRun(`INSERT INTO ${CONTACTS_TABLE_NAME}(name, frequency, lastContacted) VALUES(?, ?, 0)`, [contact.name, contact.frequency]);
    await refreshContacts();
}
exports.createContact = createContact;
async function updateContact(contact) {
    await dbRun(`UPDATE ${CONTACTS_TABLE_NAME} SET name = ?, frequency = ? WHERE id = ?`, [contact.name, contact.frequency, contact.id]);
    await refreshContacts();
}
exports.updateContact = updateContact;
async function setLastContactedDate(contact, lastContactedDate) {
    await dbRun(`UPDATE ${CONTACTS_TABLE_NAME} SET lastContacted = ? WHERE id = ?`, [lastContactedDate, contact.id]);
    await refreshContacts();
}
exports.setLastContactedDate = setLastContactedDate;
async function deleteContact(contact) {
    // TODO: delete from queue if they're in there
    dbRun(`DELETE FROM ${CONTACTS_TABLE_NAME} WHERE id = ?`, [contact.id]);
    await refreshContacts();
}
exports.deleteContact = deleteContact;
// Queue methods
async function refreshQueue() {
    const result = await dbGet(`SELECT * FROM ${SCHEDULE_TABLE_NAME}`, []);
    const ids = JSON.parse(result.queue);
    const contactQueue = ids.map((id) => {
        for (const contact of contacts) {
            if (contact.id === id) {
                return contact;
            }
        }
        throw util_1.createInternalError(`Could not locate contact with id ${id}`);
    }).filter((contact) => !!contact);
    queue = {
        contactQueue,
        lastUpdated: result.lastUpdated
    };
    exports.dataSource.emit('queueUpdated', queue);
}
async function setWeeklyQueue(contactQueue) {
    const ids = JSON.stringify(contactQueue.map((contact) => contact.id));
    await dbRun(`UPDATE ${SCHEDULE_TABLE_NAME} SET queue = ?, lastUpdated = ?`, [ids, Date.now()]);
    await refreshQueue();
}
exports.setWeeklyQueue = setWeeklyQueue;
//# sourceMappingURL=db.js.map