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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var async_1 = require("async");
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
function respond(cb) {
    var contactQueue = __spreadArrays(db_1.dataSource.getQueue().contactQueue);
    var currentContact = contactQueue.shift();
    if (currentContact) {
        util_1.log("Responded to " + currentContact.name);
        async_1.series([
            function (next) { return db_1.setLastContactedDate(currentContact, Date.now(), next); },
            function (next) { return db_1.setWeeklyQueue(contactQueue, next); }
        ], cb);
    }
    else {
        util_1.handleInternalError('Respond called with an empty queue');
        setImmediate(cb);
    }
    var availableBuckets = 0;
    for (var _i = 0, timeBuckets_1 = timeBuckets; _i < timeBuckets_1.length; _i++) {
        var bucket = timeBuckets_1[_i];
        if (bucket.available) {
            availableBuckets++;
        }
    }
    var numBucketsToBlock = Math.floor(availableBuckets / (2 * db_1.dataSource.getQueue().contactQueue.length));
    var i = 0;
    while (numBucketsToBlock > 0 && i < timeBuckets.length) {
        if (timeBuckets[i].available) {
            timeBuckets[i].available = false;
            numBucketsToBlock--;
        }
        i++;
    }
}
exports.respond = respond;
function pushToBack(cb) {
    var contactQueue = __spreadArrays(db_1.dataSource.getQueue().contactQueue);
    var currentContact = contactQueue.shift();
    if (currentContact) {
        contactQueue.push(currentContact);
        db_1.setWeeklyQueue(contactQueue, cb);
    }
    else {
        setImmediate(cb);
    }
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
function init(cb) {
    setTimeout(tick, 5000);
    async_1.parallel([
        refreshQueue,
        refreshTimeBuckets
    ], cb);
}
exports.init = init;
function tick() {
    var now = Date.now();
    // TODO: add support for system level notification state on all three platforms (but Linux first)
    if (doNotDisturbEnabled) {
        util_1.log('Skipping notification tick because Do Not Disturb is enabled in the app or OS');
    }
    else {
        // Get rid of expired buckets, if they exist
        while (timeBuckets.length && timeBuckets[0].start + TIME_BUCKET_INTERVAL < now) {
            timeBuckets.shift();
        }
        if (!timeBuckets.length) {
            util_1.log('Determining the week\'s schedule...');
            async_1.parallel([
                refreshQueue,
                refreshTimeBuckets
            ], function () { return util_1.log('Done determing the week\'s schedule'); });
        }
        else {
            // Extra sanity-checking just in case we hit a gap in the time buckets. This *should* never happen
            if (timeBuckets.length && timeBuckets[0].start < now) {
                var currentBucket = timeBuckets.shift();
                if (currentBucket && currentBucket.available) {
                    showNotification();
                }
                else {
                    util_1.log('Nothing to do this interval because the user is not available');
                }
            }
            else {
                util_1.handleInternalError('Gap in time buckets detected');
            }
        }
    }
    setTimeout(tick, TIME_BUCKET_INTERVAL);
}
function refreshTimeBuckets(cb) {
    var endOfWeek = moment().endOf('week');
    var currentBucket = moment().startOf('hour');
    timeBuckets = [];
    while (currentBucket.isBefore(endOfWeek)) {
        var available = currentBucket.hour() >= START_OF_AVAILABILITY &&
            currentBucket.hour() < END_OF_AVAILABILITY &&
            currentBucket.day() > 0 &&
            currentBucket.day() < 6;
        timeBuckets.push({
            start: currentBucket.toDate().getTime(),
            available: available
        });
        currentBucket.add(TIME_BUCKET_INTERVAL, 'milliseconds');
    }
    setImmediate(cb);
}
function refreshQueue(cb) {
    var queue = db_1.dataSource.getQueue();
    var lastUpdated = moment(queue.lastUpdated);
    if (lastUpdated.isAfter(moment().startOf('week'))) {
        setImmediate(cb);
        return;
    }
    var contacts = db_1.dataSource.getContacts();
    var weights = [];
    for (var _i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
        var contact = contacts_1[_i];
        var gap = Date.now() - contact.lastContacted;
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
    // Shuffle the list using the Fisher-Yates algorithm:
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    var newContactQueue = weights
        .sort(function (a, b) { return b.weight - a.weight; })
        .slice(0, MAX_WEEKLY_CONTACTS)
        .map(function (weight) { return weight.contact; });
    for (var i = newContactQueue.length - 1; i > 0; i--) {
        var j = Math.round(Math.random() * i);
        var temp = newContactQueue[i];
        newContactQueue[i] = newContactQueue[j];
        newContactQueue[j] = temp;
    }
    util_1.log("Scheduling " + newContactQueue.length + " contacts out of " + weights.length + " possible contacts");
    async_1.series([
        function (next) { return db_1.setWeeklyQueue(newContactQueue, next); },
        function (next) { return refreshTimeBuckets(next); }
    ], cb);
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