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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./common/constants");
var util_1 = require("./util");
var mongodb_1 = require("mongodb");
var db;
var userInfoCache = {};
function connect(cb) {
    mongodb_1.MongoClient.connect(util_1.getEnvironmentVariable('COSMOS_CONNECTION_STRING'), function (connectErr, client) {
        if (connectErr) {
            if (cb) {
                cb(connectErr);
            }
            return;
        }
        db = client.db(util_1.getEnvironmentVariable('COSMOS_DB_NAME'));
        db.on('close', function (closeErr) {
            if (closeErr) {
                console.error("MongoDB connection was closed and will be reconnected. Close error: " + closeErr);
            }
            else {
                console.warn('MongoDB connection was closed and will be reconnected');
            }
            // TODO: need to buffer requests between connects...or just switch to mongoose?
            connect();
        });
        console.log('Connected to MongoDB');
        if (cb) {
            cb(undefined);
        }
    });
}
function init(cb) {
    connect(function (connectErr) {
        if (connectErr) {
            cb(connectErr);
            return;
        }
        db.collection(constants_1.DB_COLLECTIONS.USERS).find({}).forEach(function (doc) {
            userInfoCache[doc.id] = doc;
        }, cb);
    });
}
exports.init = init;
function isUserRegistered(id) {
    return userInfoCache.hasOwnProperty(id);
}
exports.isUserRegistered = isUserRegistered;
function getUsers() {
    var users = [];
    for (var userId in userInfoCache) {
        if (!userInfoCache.hasOwnProperty(userId)) {
            continue;
        }
        users.push(userInfoCache[userId]);
    }
    return users;
}
exports.getUsers = getUsers;
function getPushSubscription(id) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    var subscription = userInfoCache[id].state.subscription;
    if (!subscription) {
        throw new Error("Internal Error: No subscription info for user " + id);
    }
    return subscription;
}
exports.getPushSubscription = getPushSubscription;
function setPushSubscription(id, subscription, cb) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    db.collection(constants_1.DB_COLLECTIONS.USERS).updateOne({ id: id }, { $set: { subscription: subscription } }, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        userInfoCache[id].state.subscription = subscription;
        cb(undefined);
    });
}
exports.setPushSubscription = setPushSubscription;
function getContacts(id) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    return userInfoCache[id].contacts;
}
exports.getContacts = getContacts;
function setContacts(id, contacts, cb) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    db.collection(constants_1.DB_COLLECTIONS.USERS).updateOne({ id: id }, { $set: { contacts: contacts } }, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        userInfoCache[id].contacts = contacts;
        cb(undefined);
    });
}
exports.setContacts = setContacts;
function getDailyBuckets(id) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    return userInfoCache[id].state.dailyBuckets;
}
exports.getDailyBuckets = getDailyBuckets;
function setDailyBuckets(id, dailyBuckets, cb) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    var dailyBucketsUpdated = Date.now();
    var update = {
        $set: {
            state: __assign({}, userInfoCache[id].state, { dailyBuckets: dailyBuckets,
                dailyBucketsUpdated: dailyBucketsUpdated })
        }
    };
    db.collection(constants_1.DB_COLLECTIONS.USERS).updateOne({ id: id }, update, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        userInfoCache[id].state.dailyBuckets = dailyBuckets;
        userInfoCache[id].state.dailyBucketsUpdated = dailyBucketsUpdated;
        cb(undefined);
    });
}
exports.setDailyBuckets = setDailyBuckets;
function getWeeklyContactList(id) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    return userInfoCache[id].state.weeklyContactList;
}
exports.getWeeklyContactList = getWeeklyContactList;
function setWeeklyContactList(id, weeklyContactList, cb) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    var weeklyContactListUpdated = Date.now();
    var update = {
        $set: {
            state: __assign({}, userInfoCache[id].state, { weeklyContactList: weeklyContactList,
                weeklyContactListUpdated: weeklyContactListUpdated })
        }
    };
    db.collection(constants_1.DB_COLLECTIONS.USERS).updateOne({ id: id }, update, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        userInfoCache[id].state.weeklyContactList = weeklyContactList;
        userInfoCache[id].state.weeklyContactListUpdated = weeklyContactListUpdated;
        cb(undefined);
    });
}
exports.setWeeklyContactList = setWeeklyContactList;
//# sourceMappingURL=db.js.map