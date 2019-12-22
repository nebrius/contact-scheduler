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
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var events_1 = require("events");
var electron_1 = require("electron");
var sqlite3_1 = require("sqlite3");
var util_1 = require("./util");
var CALENDARS_TABLE_NAME = 'calendars';
var CONTACTS_TABLE_NAME = 'contacts';
var SCHEDULE_TABLE_NAME = 'schedule';
console.log(electron_1.app);
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
        return __spreadArrays(calendars);
    };
    DataSource.prototype.getContacts = function () {
        return __spreadArrays(contacts);
    };
    DataSource.prototype.getQueue = function () {
        return __assign({}, queue);
    };
    return DataSource;
}(events_1.EventEmitter));
function dbRun(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!db) {
                throw util_1.createInternalError("dbRun called before database initialized");
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db.run(query, parameters || [], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                })];
        });
    });
}
function dbAll(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!db) {
                throw util_1.createInternalError("dbRun called before database initialized");
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db.all(query, parameters, function (err, results) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(results);
                        }
                    });
                })];
        });
    });
}
function dbGet(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!db) {
                throw util_1.createInternalError("dbRun called before database initialized");
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db.get(query, parameters, function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result);
                        }
                    });
                })];
        });
    });
}
exports.dataSource = new DataSource();
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var isNewDB, sqlite3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isNewDB = !fs_1.existsSync(dbPath);
                    sqlite3 = sqlite3_1.verbose();
                    util_1.log("Loading database from " + dbPath);
                    return [4 /*yield*/, new Promise(function (resolve, reject) { return new sqlite3.Database(dbPath, function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                        }); })];
                case 1:
                    // Can't use promisify here cause it barfs on constructors, aparently
                    db = _a.sent();
                    if (!isNewDB) return [3 /*break*/, 6];
                    util_1.log("New database detected, initializing");
                    return [4 /*yield*/, dbRun(CALENDAR_SCHEMA)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, dbRun(CONTACT_SCHEMA)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, dbRun(SCHEDULE_SCHEMA)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, dbRun("INSERT INTO " + SCHEDULE_TABLE_NAME + "(queue, lastUpdated) VALUES(?, 0)", ['[]'])];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, refreshContacts()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, refreshCalendars()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, refreshQueue()];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
// Calendar methods
function refreshCalendars() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbAll("SELECT * FROM " + CALENDARS_TABLE_NAME, [])];
                case 1:
                    calendars = _a.sent();
                    exports.dataSource.emit('calendarsUpdated', calendars);
                    return [2 /*return*/];
            }
        });
    });
}
function createCalendar(calendar) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbRun("INSERT INTO " + CALENDARS_TABLE_NAME + "(displayName, source) VALUES(?, ?)", [calendar.displayName, calendar.source]);
                    return [4 /*yield*/, refreshCalendars()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createCalendar = createCalendar;
function updateCalendar(calendar) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbRun("UPDATE " + CALENDARS_TABLE_NAME + " SET displayName = ?, source = ? WHERE id = ?", [calendar.displayName, calendar.source, calendar.id]);
                    return [4 /*yield*/, refreshCalendars()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateCalendar = updateCalendar;
function deleteCalendar(calendar) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbRun("DELETE FROM " + CALENDARS_TABLE_NAME + " WHERE id = ?", [calendar.id]);
                    return [4 /*yield*/, refreshCalendars()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteCalendar = deleteCalendar;
// Contact methods
function refreshContacts() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbAll("SELECT * FROM " + CONTACTS_TABLE_NAME, [])];
                case 1:
                    contacts = _a.sent();
                    exports.dataSource.emit('contactsUpdated', contacts);
                    return [2 /*return*/];
            }
        });
    });
}
function createContact(contact) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbRun("INSERT INTO " + CONTACTS_TABLE_NAME + "(name, frequency, lastContacted) VALUES(?, ?, 0)", [contact.name, contact.frequency])];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshContacts()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createContact = createContact;
function updateContact(contact) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbRun("UPDATE " + CONTACTS_TABLE_NAME + " SET name = ?, frequency = ? WHERE id = ?", [contact.name, contact.frequency, contact.id]);
                    return [4 /*yield*/, refreshContacts()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateContact = updateContact;
function setLastContactedDate(contact, lastContactedDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbRun("UPDATE " + CONTACTS_TABLE_NAME + " SET lastContacted = ? WHERE id = ?", [lastContactedDate, contact.id]);
                    return [4 /*yield*/, refreshContacts()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setLastContactedDate = setLastContactedDate;
function deleteContact(contact) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // TODO: delete from queue if they're in there
                    dbRun("DELETE FROM " + CONTACTS_TABLE_NAME + " WHERE id = ?", [contact.id]);
                    return [4 /*yield*/, refreshContacts()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteContact = deleteContact;
// Queue methods
function refreshQueue() {
    return __awaiter(this, void 0, void 0, function () {
        var result, ids, contactQueue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbGet("SELECT * FROM " + SCHEDULE_TABLE_NAME, [])];
                case 1:
                    result = _a.sent();
                    ids = JSON.parse(result.queue);
                    contactQueue = ids.map(function (id) {
                        for (var _i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
                            var contact = contacts_1[_i];
                            if (contact.id === id) {
                                return contact;
                            }
                        }
                        throw util_1.createInternalError("Could not locate contact with id " + id);
                    }).filter(function (contact) { return !!contact; });
                    queue = {
                        contactQueue: contactQueue,
                        lastUpdated: result.lastUpdated
                    };
                    exports.dataSource.emit('queueUpdated', queue);
                    return [2 /*return*/];
            }
        });
    });
}
function setWeeklyQueue(contactQueue) {
    return __awaiter(this, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ids = JSON.stringify(contactQueue.map(function (contact) { return contact.id; }));
                    return [4 /*yield*/, dbRun("UPDATE " + SCHEDULE_TABLE_NAME + " SET queue = ?, lastUpdated = ?", [ids, Date.now()])];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshQueue()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setWeeklyQueue = setWeeklyQueue;
//# sourceMappingURL=db.js.map