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
            userInfoCache[doc.id] = {
                id: doc.id,
                name: doc.name,
                timezone: doc.timezone,
                contacts: doc.contacts,
                subscription: doc.subscription
            };
        }, cb);
    });
}
exports.init = init;
function isUserRegistered(id) {
    return userInfoCache.hasOwnProperty(id);
}
exports.isUserRegistered = isUserRegistered;
function getPushSubscription(id) {
    if (!userInfoCache[id]) {
        throw new Error("Internal Error: Unknown user ID " + id);
    }
    var subscription = userInfoCache[id].subscription;
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
        userInfoCache[id].subscription = subscription;
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
//# sourceMappingURL=db.js.map