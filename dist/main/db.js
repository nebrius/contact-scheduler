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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var events_1 = require("events");
var electron_1 = require("electron");
var async_1 = require("async");
var sqlite3_1 = require("sqlite3");
var util_1 = require("./util");
var CALENDARS_TABLE_NAME = 'calendars';
var CONTACTS_TABLE_NAME = 'contacts';
var SCHEDULE_TABLE_NAME = 'schedule';
var dbPath = path_1.join(electron_1.app.getPath('userData'), 'contact-scheduler-db.sqlite3');
var db;
var CALENDAR_SCHEMA = "CREATE TABLE " + CALENDARS_TABLE_NAME + "(\n  id INTEGER PRIMARY KEY,\n  displayName text NOT NULL,\n  source text NOT NULL\n)";
var CONTACT_SCHEMA = "CREATE TABLE " + CONTACTS_TABLE_NAME + "(\n  id INTEGER PRIMARY KEY,\n  name text NOT NULL,\n  frequency text NOT NULL,\n  lastContacted INTEGER NOT NULL\n)";
var SCHEDULE_SCHEMA = "CREATE TABLE " + SCHEDULE_TABLE_NAME + "(\n  id INTEGER PRIMARY KEY,\n  queue text NOT NULL,\n  lastUpdated INTEGER NOT NULL\n)";
var calendars = [];
var contacts = [];
var queue = {
    contactQueue: [],
    lastUpdated: 0
};
var DataSource = /** @class */ (function (_super) {
    __extends(DataSource, _super);
    function DataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSource.prototype.getCalendars = function () {
        return calendars.slice();
    };
    DataSource.prototype.getContacts = function () {
        return contacts.slice();
    };
    DataSource.prototype.getQueue = function () {
        return __assign({}, queue);
    };
    return DataSource;
}(events_1.EventEmitter));
exports.dataSource = new DataSource();
function init(cb) {
    var isNewDB = !fs_1.existsSync(dbPath);
    var sqlite3 = sqlite3_1.verbose();
    util_1.log("Loading database from " + dbPath);
    async_1.waterfall([
        function (next) { return (db = new sqlite3.Database(dbPath, next)); },
        function (next) {
            if (!isNewDB) {
                next(undefined);
                return;
            }
            util_1.log("New database detected, initializing");
            // Need to slice off extra params so can't pass cb or next directly here
            async_1.series([
                function (nextInit) { return db.run(CALENDAR_SCHEMA, function (err) { return nextInit(err); }); },
                function (nextInit) { return db.run(CONTACT_SCHEMA, function (err) { return nextInit(err); }); },
                function (nextInit) { return db.run(SCHEDULE_SCHEMA, function (err) { return nextInit(err); }); },
                function (nextInit) { return db.run("INSERT INTO " + SCHEDULE_TABLE_NAME + "(queue, lastUpdated) VALUES(?, 0)", ['[]'], function (err) { return nextInit(err); }); }
            ], function (err) { return next(err); });
        },
        function (next) { return refreshContacts(next); },
        function (next) { return refreshCalendars(next); },
        function (next) { return refreshQueue(next); }
    ], cb);
}
exports.init = init;
function refreshCalendars(cb) {
    async_1.waterfall([
        function (next) { return db.all("SELECT * FROM " + CALENDARS_TABLE_NAME, [], next); },
        function (newCalendars, next) {
            calendars = newCalendars;
            exports.dataSource.emit('calendarsUpdated', calendars);
            next(undefined);
        }
    ], cb);
}
function createCalendar(calendar, cb) {
    async_1.waterfall([
        function (next) { return db.run("INSERT INTO " + CALENDARS_TABLE_NAME + "(displayName, source) VALUES(?, ?)", [calendar.displayName, calendar.source], next); },
        function (next) { return refreshCalendars(next); }
    ], cb);
}
exports.createCalendar = createCalendar;
function updateCalendar(calendar, cb) {
    async_1.waterfall([
        function (next) { return db.run("UPDATE " + CALENDARS_TABLE_NAME + " SET displayName = ?, source = ? WHERE id = ?", [calendar.displayName, calendar.source, calendar.id], next); },
        function (next) { return refreshCalendars(next); }
    ], cb);
}
exports.updateCalendar = updateCalendar;
function deleteCalendar(calendar, cb) {
    async_1.waterfall([
        function (next) { return db.run("DELETE FROM " + CALENDARS_TABLE_NAME + " WHERE id = ?", [calendar.id], next); },
        function (next) { return refreshCalendars(next); }
    ], cb);
}
exports.deleteCalendar = deleteCalendar;
function refreshContacts(cb) {
    async_1.waterfall([
        function (next) { return db.all("SELECT * FROM " + CONTACTS_TABLE_NAME, [], next); },
        function (newContacts, next) {
            contacts = newContacts;
            exports.dataSource.emit('contactsUpdated', contacts);
            next(undefined);
        }
    ], cb);
}
function createContact(contact, cb) {
    async_1.waterfall([
        function (next) { return db.run("INSERT INTO " + CONTACTS_TABLE_NAME + "(name, frequency, lastContacted) VALUES(?, ?, 0)", [contact.name, contact.frequency], next); },
        function (next) { return refreshContacts(next); }
    ], cb);
}
exports.createContact = createContact;
function updateContact(contact, cb) {
    async_1.waterfall([
        function (next) { return db.run("UPDATE " + CONTACTS_TABLE_NAME + " SET name = ?, frequency = ? WHERE id = ?", [contact.name, contact.frequency, contact.id], next); },
        function (next) { return refreshContacts(next); }
    ], cb);
}
exports.updateContact = updateContact;
function setLastContactedDate(contact, lastContactedDate, cb) {
    async_1.waterfall([
        function (next) { return db.run("UPDATE " + CONTACTS_TABLE_NAME + " SET lastContacted = ? WHERE id = ?", [lastContactedDate, contact.id], next); },
        function (next) { return refreshContacts(next); }
    ], cb);
}
exports.setLastContactedDate = setLastContactedDate;
function deleteContact(contact, cb) {
    async_1.waterfall([
        function (next) { return db.run("DELETE FROM " + CONTACTS_TABLE_NAME + " WHERE id = ?", [contact.id], next); },
        function (next) { return refreshContacts(next); }
    ], cb);
}
exports.deleteContact = deleteContact;
function refreshQueue(cb) {
    async_1.waterfall([
        function (next) { return db.get("SELECT * FROM " + SCHEDULE_TABLE_NAME, [], next); },
        function (result, next) {
            var ids = JSON.parse(result.queue);
            var contactQueue = ids.map(function (id) {
                for (var _i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
                    var contact = contacts_1[_i];
                    if (contact.id === id) {
                        return contact;
                    }
                }
                next(util_1.handleInternalError("Could not locate contact with id " + id));
                return null;
            }).filter(function (contact) { return !!contact; });
            queue = {
                contactQueue: contactQueue,
                lastUpdated: result.lastUpdated
            };
            exports.dataSource.emit('queueUpdated', queue);
            next(undefined);
        }
    ], cb);
}
function setWeeklyQueue(contactQueue, cb) {
    var ids = JSON.stringify(contactQueue.map(function (contact) { return contact.id; }));
    async_1.waterfall([
        function (next) { return db.run("UPDATE " + SCHEDULE_TABLE_NAME + " SET queue = ?, lastUpdated = ?", [ids, Date.now()], next); },
        function (next) { return refreshQueue(next); }
    ], cb);
}
exports.setWeeklyQueue = setWeeklyQueue;
//# sourceMappingURL=db.js.map