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
var async_1 = require("async");
var web_push_1 = require("web-push");
var util_1 = require("./util");
var types_1 = require("./common/types");
var util_2 = require("./util");
var db_1 = require("./db");
var HOUR_IN_MS = 60 * 60 * 1000;
var BUCKET_DURATION = HOUR_IN_MS;
var MONTHLY_THRESHOLD = HOUR_IN_MS * 24 * 25;
var QUARTERLY_THRESHOLD = HOUR_IN_MS * 24 * 80;
function init(cb) {
    web_push_1.setVapidDetails('mailto:bryan@nebri.us', util_1.getEnvironmentVariable('PUSH_PUBLIC_KEY'), util_1.getEnvironmentVariable('PUSH_PRIVATE_KEY'));
    console.log('Notifications initialied');
    setImmediate(cb);
}
exports.init = init;
function ensureWeeklyContactList(user, cb) {
    var midnight = util_2.getStartOfToday(user.settings.timezone);
    if (user.state.weeklyContactListUpdated > util_2.getStartOfWeek(user.settings.timezone)) {
        cb(undefined);
        return;
    }
    console.log('Creating the list of people to contact');
    var peopleToContact = [];
    for (var _i = 0, _a = user.contacts; _i < _a.length; _i++) {
        var contact = _a[_i];
        switch (contact.frequency) {
            case types_1.Frequency.Weekly:
                peopleToContact.push(contact);
                break;
            case types_1.Frequency.Monthly:
                if (contact.lastContacted + MONTHLY_THRESHOLD < midnight) {
                    peopleToContact.push(contact);
                }
                break;
            case types_1.Frequency.Quarterly:
                if (contact.lastContacted + QUARTERLY_THRESHOLD < midnight) {
                    peopleToContact.push(contact);
                }
                break;
        }
    }
    var shuffledPeopleToContact = [];
    while (peopleToContact.length) {
        var i = Math.round(Math.random() * (peopleToContact.length - 1));
        shuffledPeopleToContact.push(peopleToContact.splice(i, 1)[0]);
    }
    db_1.setWeeklyContactList(user.id, shuffledPeopleToContact, cb);
}
function ensureDailyBuckets(user, cb) {
    var midnight = util_2.getStartOfToday(user.settings.timezone);
    if (user.state.dailyBucketsUpdated >= midnight) {
        cb(undefined);
        return;
    }
    console.log('Creating the daily buckets');
    var startOfToday = midnight + user.settings.startOfDay * HOUR_IN_MS;
    var endOfToday = midnight + user.settings.endOfDay * HOUR_IN_MS;
    var buckets = [];
    for (var timestamp = startOfToday; timestamp < endOfToday; timestamp += BUCKET_DURATION) {
        buckets.push({
            timestamp: timestamp,
            available: true // TODO: hook in calendar information
        });
    }
    db_1.setDailyBuckets(user.id, buckets, cb);
}
function processNextNotification(user, cb) {
    if (!user.state.weeklyContactList.length) {
        console.log("No more contacts to process this week, go " + user.name + "!");
        cb(undefined);
        return;
    }
    for (var _i = 0, _a = user.state.dailyBuckets; _i < _a.length; _i++) {
        var bucket = _a[_i];
        if (bucket.timestamp <= Date.now() && Date.now() < bucket.timestamp + BUCKET_DURATION) {
            if (bucket.available) {
                var nextContact = user.state.weeklyContactList[0];
                if (nextContact && user.state.subscription) {
                    console.log("Time for " + user.name + " to reach out to " + nextContact.name);
                    web_push_1.sendNotification(user.state.subscription, JSON.stringify(nextContact))
                        .then(function () { return cb(undefined); })
                        .catch(cb);
                    return;
                }
            }
        }
    }
    cb(undefined);
}
function processNotifications(cb) {
    async_1.parallel(db_1.getUsers().map(function (user) { return function (next) {
        // const dayOfWeek = (new Date(midnight)).getDay();
        // if (dayOfWeek === 0 || dayOfWeek === 6) {
        //   console.log('skipping due to the weekend');
        //   next(undefined);
        //   return;
        // }
        async_1.series([
            function (nextStep) { return ensureWeeklyContactList(user, nextStep); },
            function (nextStep) { return ensureDailyBuckets(user, nextStep); },
            function (nextStep) { return processNextNotification(user, nextStep); }
        ], next);
    }; }), cb);
}
exports.processNotifications = processNotifications;
function rescheduleCurrentNotification(userId, cb) {
    var weeklyContacts = db_1.getUser(userId).state.weeklyContactList;
    var contact = weeklyContacts.shift();
    if (!contact) {
        throw new Error("Internal Error: weekly contacts list is empty for user " + userId);
    }
    weeklyContacts.push(contact);
    db_1.setWeeklyContactList(userId, weeklyContacts, cb);
}
exports.rescheduleCurrentNotification = rescheduleCurrentNotification;
function respondToCurrentNotification(userId, cb) {
    var weeklyContacts = db_1.getUser(userId).state.weeklyContactList;
    var contact = weeklyContacts.shift();
    if (!contact) {
        throw new Error("Internal Error: weekly contacts list is empty for user " + userId);
    }
    db_1.setWeeklyContactList(userId, weeklyContacts, cb);
}
exports.respondToCurrentNotification = respondToCurrentNotification;
//# sourceMappingURL=notifications.js.map