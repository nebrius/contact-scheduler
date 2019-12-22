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
var path_1 = require("path");
var db_1 = require("./db");
var moment = require("moment-timezone");
var electron_1 = require("electron");
var util_1 = require("./util");
// TODO: These settings should be made configurable by the user eventually
var TIME_BUCKET_INTERVAL = 1000 * 60 * 15;
var NOTIFICATION_DURATION = 15000;
var MAX_WEEKLY_CONTACTS = 10;
var START_OF_AVAILABILITY = 10;
var END_OF_AVAILABILITY = 17;
var timeBuckets = [];
var notificationWindow;
var doNotDisturbEnabled = false;
var NOTIFICATION_WIDTH = 310;
var NOTIFICATION_HEIGHT = 150;
var DAY_IN_MS = 1000 * 60 * 60 * 24;
var MIN_MONTHLY_GAP = DAY_IN_MS * 25;
var MONTHLY_GAP_SCALING_FACTOR = 0.1 / DAY_IN_MS;
var MIN_QUARTERLY_GAP = DAY_IN_MS * 80;
var QUARTERLY_GAP_SCALING_FACTOR = 0.05 / DAY_IN_MS;
function respond() {
    return __awaiter(this, void 0, void 0, function () {
        var contactQueue, currentContact, availableBuckets, _i, timeBuckets_1, bucket, numBucketsToBlock, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contactQueue = __spreadArrays(db_1.dataSource.getQueue().contactQueue);
                    currentContact = contactQueue.shift();
                    if (!currentContact) return [3 /*break*/, 3];
                    util_1.log("Responded to " + currentContact.name);
                    return [4 /*yield*/, db_1.setLastContactedDate(currentContact, Date.now())];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.setWeeklyQueue(contactQueue)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3: throw util_1.createInternalError('Respond called with an empty queue');
                case 4:
                    availableBuckets = 0;
                    for (_i = 0, timeBuckets_1 = timeBuckets; _i < timeBuckets_1.length; _i++) {
                        bucket = timeBuckets_1[_i];
                        if (bucket.available) {
                            availableBuckets++;
                        }
                    }
                    numBucketsToBlock = Math.floor(availableBuckets / (2 * db_1.dataSource.getQueue().contactQueue.length));
                    i = 0;
                    while (numBucketsToBlock > 0 && i < timeBuckets.length) {
                        if (timeBuckets[i].available) {
                            timeBuckets[i].available = false;
                            numBucketsToBlock--;
                        }
                        i++;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.respond = respond;
function pushToBack() {
    return __awaiter(this, void 0, void 0, function () {
        var contactQueue, currentContact;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contactQueue = __spreadArrays(db_1.dataSource.getQueue().contactQueue);
                    currentContact = contactQueue.shift();
                    if (!currentContact) return [3 /*break*/, 2];
                    contactQueue.push(currentContact);
                    return [4 /*yield*/, db_1.setWeeklyQueue(contactQueue)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.pushToBack = pushToBack;
function closeNotification() {
    if (notificationWindow) {
        notificationWindow.close();
    }
}
exports.closeNotification = closeNotification;
function enableDoNotDisturb() {
    util_1.log('Enabling Do Not Disturb mode');
    doNotDisturbEnabled = true;
}
exports.enableDoNotDisturb = enableDoNotDisturb;
function disableDoNotDisturb() {
    util_1.log('Disabling Do Not Disturb mode');
    doNotDisturbEnabled = false;
}
exports.disableDoNotDisturb = disableDoNotDisturb;
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setTimeout(tick, 5000);
                    return [4 /*yield*/, refreshQueue()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshTimeBuckets()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
function tick() {
    return __awaiter(this, void 0, void 0, function () {
        var now, currentBucket;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    if (!doNotDisturbEnabled) return [3 /*break*/, 1];
                    util_1.log('Skipping notification tick because Do Not Disturb is enabled in the app or OS');
                    return [3 /*break*/, 5];
                case 1:
                    // Get rid of expired buckets, if they exist
                    while (timeBuckets.length && timeBuckets[0].start + TIME_BUCKET_INTERVAL < now) {
                        timeBuckets.shift();
                    }
                    if (!!timeBuckets.length) return [3 /*break*/, 4];
                    util_1.log('Determining the week\'s schedule...');
                    return [4 /*yield*/, refreshQueue()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshTimeBuckets()];
                case 3:
                    _a.sent();
                    util_1.log('Done determing the week\'s schedule');
                    return [3 /*break*/, 5];
                case 4:
                    // Extra sanity-checking just in case we hit a gap in the time buckets. This *should* never happen
                    if (timeBuckets.length && timeBuckets[0].start < now) {
                        currentBucket = timeBuckets.shift();
                        if (currentBucket && currentBucket.available) {
                            showNotification();
                        }
                        else {
                            util_1.log('Nothing to do this interval because the user is not available');
                        }
                    }
                    else {
                        throw util_1.createInternalError('Gap in time buckets detected');
                    }
                    _a.label = 5;
                case 5:
                    setTimeout(tick, TIME_BUCKET_INTERVAL);
                    return [2 /*return*/];
            }
        });
    });
}
function refreshTimeBuckets() {
    return __awaiter(this, void 0, void 0, function () {
        var endOfWeek, currentBucket, available;
        return __generator(this, function (_a) {
            endOfWeek = moment().endOf('week');
            currentBucket = moment().startOf('hour');
            timeBuckets = [];
            while (currentBucket.isBefore(endOfWeek)) {
                available = currentBucket.hour() >= START_OF_AVAILABILITY &&
                    currentBucket.hour() < END_OF_AVAILABILITY &&
                    currentBucket.day() > 0 &&
                    currentBucket.day() < 6;
                timeBuckets.push({
                    start: currentBucket.toDate().getTime(),
                    available: available
                });
                currentBucket.add(TIME_BUCKET_INTERVAL, 'milliseconds');
            }
            return [2 /*return*/, Promise.resolve()];
        });
    });
}
function refreshQueue() {
    return __awaiter(this, void 0, void 0, function () {
        var queue, lastUpdated, contacts, weights, _i, contacts_1, contact, gap, newContactQueue, i, j, temp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queue = db_1.dataSource.getQueue();
                    lastUpdated = moment(queue.lastUpdated);
                    if (lastUpdated.isAfter(moment().startOf('week'))) {
                        return [2 /*return*/, Promise.resolve()];
                    }
                    contacts = db_1.dataSource.getContacts();
                    weights = [];
                    for (_i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
                        contact = contacts_1[_i];
                        gap = Date.now() - contact.lastContacted;
                        switch (contact.frequency) {
                            case 'weekly':
                                weights.push({
                                    contact: contact,
                                    weight: 1
                                });
                                break;
                            case 'monthly':
                                if (gap > MIN_MONTHLY_GAP) {
                                    weights.push({
                                        contact: contact,
                                        weight: Math.min(1, MONTHLY_GAP_SCALING_FACTOR * (gap - MIN_MONTHLY_GAP))
                                    });
                                }
                                break;
                            case 'quarterly':
                                if (gap > MIN_QUARTERLY_GAP) {
                                    weights.push({
                                        contact: contact,
                                        weight: Math.min(1, QUARTERLY_GAP_SCALING_FACTOR * (gap - MIN_QUARTERLY_GAP))
                                    });
                                }
                                break;
                        }
                    }
                    newContactQueue = weights
                        .sort(function (a, b) { return b.weight - a.weight; })
                        .slice(0, MAX_WEEKLY_CONTACTS)
                        .map(function (weight) { return weight.contact; });
                    for (i = newContactQueue.length - 1; i > 0; i--) {
                        j = Math.round(Math.random() * i);
                        temp = newContactQueue[i];
                        newContactQueue[i] = newContactQueue[j];
                        newContactQueue[j] = temp;
                    }
                    util_1.log("Scheduling " + newContactQueue.length + " contacts out of " + weights.length + " possible contacts");
                    return [4 /*yield*/, db_1.setWeeklyQueue(newContactQueue)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshTimeBuckets()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function showNotification() {
    var contact = db_1.dataSource.getQueue().contactQueue[0];
    if (!contact) {
        return;
    }
    var args = { contact: contact };
    util_1.log("Showing notification for " + args.contact.name);
    var _a = electron_1.screen.getPrimaryDisplay().size, width = _a.width, height = _a.height;
    notificationWindow = new electron_1.BrowserWindow({
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        x: width - NOTIFICATION_WIDTH - 20,
        y: height - NOTIFICATION_HEIGHT - 20,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        webPreferences: {
            additionalArguments: [JSON.stringify(args)]
        }
    });
    notificationWindow.on('closed', function () {
        notificationWindow = null;
    });
    notificationWindow.once('ready-to-show', function () {
        if (notificationWindow) {
            notificationWindow.show();
        }
        setTimeout(function () {
            if (notificationWindow) {
                notificationWindow.close();
            }
        }, NOTIFICATION_DURATION);
    });
    notificationWindow.loadFile(path_1.join(__dirname, '..', 'renderer', 'dist', 'notification.html'));
}
//# sourceMappingURL=scheduler.js.map