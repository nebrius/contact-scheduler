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
var fs_1 = require("fs");
var path_1 = require("path");
var electron_1 = require("electron");
var async_1 = require("async");
var sqlite3_1 = require("sqlite3");
var dbPath = path_1.join(electron_1.app.getPath('userData'), 'contact-scheduler-db.sqlite3');
var db;
var CALENDAR_SCHEMA = "CREATE TABLE calendars(\n  id INTEGER PRIMARY KEY,\n  displayName text NOT NULL,\n  source text NOT NULL\n)";
var CONTACT_SCHEMA = "CREATE TABLE contacts(\n  id INTEGER PRIMARY KEY,\n  name text NOT NULL,\n  frequency text NOT NULL\n)";
function init(cb) {
    var isNewDB = !fs_1.existsSync(dbPath);
    var sqlite3 = sqlite3_1.verbose();
    db = new sqlite3.Database(dbPath, function (connectErr) {
        if (connectErr) {
            cb(connectErr);
            return;
        }
        if (isNewDB) {
            async_1.series([
                function (next) { return db.run(CALENDAR_SCHEMA, next); },
                function (next) { return db.run(CONTACT_SCHEMA, next); }
            ], function (err) { return cb(err); }); // Need to slice off extra params so can't pass cb directly
        }
        else {
            cb(undefined);
        }
    });
}
exports.init = init;
function getCalendars(cb) {
    db.all('SELECT * FROM calendars', [], function (err, rows) {
        if (err) {
            cb(err, undefined);
            return;
        }
        cb(undefined, rows);
    });
}
exports.getCalendars = getCalendars;
function createCalendar(calendar, cb) {
    db.run("INSERT INTO calendars(displayName, source) VALUES(?, ?)", [calendar.displayName, calendar.source], cb);
}
exports.createCalendar = createCalendar;
function getContacts(cb) {
    db.all('SELECT * FROM contacts', [], function (err, rows) {
        if (err) {
            cb(err, undefined);
            return;
        }
        cb(undefined, rows);
    });
}
exports.getContacts = getContacts;
function createContact(contact, cb) {
    db.run("INSERT INTO contacts(name, frequency) VALUES(?, ?)", [contact.name, contact.frequency], cb);
}
exports.createContact = createContact;
//# sourceMappingURL=db.js.map