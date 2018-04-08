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

import { DB_COLLECTIONS } from './common/constants';
import { CB, IUser, IContact, IPushSubscription, IDailyBucket } from './common/types';
import { getEnvironmentVariable } from './util';
import { MongoClient, Db } from 'mongodb';

let db: Db;
const userInfoCache: { [ id: string ]: IUser } = {};

function connect(cb?: CB) {
  MongoClient.connect(getEnvironmentVariable('COSMOS_CONNECTION_STRING'), (connectErr, client) => {
    if (connectErr) {
      if (cb) {
        cb(connectErr);
      }
      return;
    }
    db = client.db(getEnvironmentVariable('COSMOS_DB_NAME'));
    db.on('close', (closeErr) => {
      if (closeErr) {
        console.error(`MongoDB connection was closed and will be reconnected. Close error: ${closeErr}`);
      } else {
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

export function init(cb: CB): void {
  connect((connectErr) => {
    if (connectErr) {
      cb(connectErr);
      return;
    }
    db.collection(DB_COLLECTIONS.USERS).find({}).forEach((doc: IUser) => {
      userInfoCache[doc.id] = doc;
    }, cb);
  });
}

export function isUserRegistered(id: string): boolean {
  return userInfoCache.hasOwnProperty(id);
}

export function getUsers(): IUser[] {
  const users: IUser[] = [];
  for (const userId in userInfoCache) {
    if (!userInfoCache.hasOwnProperty(userId)) {
      continue;
    }
    users.push(userInfoCache[userId]);
  }
  return users;
}

export function getPushSubscription(id: string): IPushSubscription {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  const subscription = userInfoCache[id].state.subscription;
  if (!subscription) {
    throw new Error(`Internal Error: No subscription info for user ${id}`);
  }
  return subscription;
}

export function setPushSubscription(id: string, subscription: IPushSubscription, cb: CB): void {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  db.collection(DB_COLLECTIONS.USERS).updateOne({ id }, { $set: { subscription } }, (err, result) => {
    if (err) {
      cb(err);
      return;
    }
    userInfoCache[id].state.subscription = subscription;
    cb(undefined);
  });
}

export function getContacts(id: string): IContact[] {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  return userInfoCache[id].contacts;
}

export function setContacts(id: string, contacts: IContact[], cb: CB): void {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  db.collection(DB_COLLECTIONS.USERS).updateOne({ id }, { $set: { contacts } }, (err, result) => {
    if (err) {
      cb(err);
      return;
    }
    userInfoCache[id].contacts = contacts;
    cb(undefined);
  });
}

export function getDailyBuckets(id: string): IDailyBucket[] {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  return userInfoCache[id].state.dailyBuckets;
}

export function setDailyBuckets(id: string, dailyBuckets: IDailyBucket[], cb: CB): void {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  const dailyBucketsUpdated = Date.now();
  const update = {
    $set: {
      state: {
        ...userInfoCache[id].state,
        dailyBuckets,
        dailyBucketsUpdated,
      }
    }
  };
  db.collection(DB_COLLECTIONS.USERS).updateOne({ id }, update, (err, result) => {
    if (err) {
      cb(err);
      return;
    }
    userInfoCache[id].state.dailyBuckets = dailyBuckets;
    userInfoCache[id].state.dailyBucketsUpdated = dailyBucketsUpdated;
    cb(undefined);
  });
}

export function getWeeklyContactList(id: string): IContact[] {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  return userInfoCache[id].state.weeklyContactList;
}

export function setWeeklyContactList(id: string, weeklyContactList: IContact[], cb: CB): void {
  if (!userInfoCache[id]) {
    throw new Error(`Internal Error: Unknown user ID ${id}`);
  }
  const weeklyContactListUpdated = Date.now();
  const update = {
    $set: {
      state: {
        ...userInfoCache[id].state,
        weeklyContactList,
        weeklyContactListUpdated,
      }
    }
  };
  db.collection(DB_COLLECTIONS.USERS).updateOne({ id }, update, (err, result) => {
    if (err) {
      cb(err);
      return;
    }
    userInfoCache[id].state.weeklyContactList = weeklyContactList;
    userInfoCache[id].state.weeklyContactListUpdated = weeklyContactListUpdated;
    cb(undefined);
  });
}
