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

import { COLLECTIONS } from './common/db_info';
import { CB } from './common/cb';
import { IUser, IContact } from './common/IUser';
import { getEnvironmentVariable } from './util';
import { MongoClient, Db } from 'mongodb';

let db: Db;
const userInfoCache: { [ userId: string ]: IUser } = {};

export function init(cb: CB): void {
  MongoClient.connect(getEnvironmentVariable('COSMOS_CONNECTION_STRING'), (connectErr, client) => {
    if (connectErr) {
      cb(connectErr);
      return;
    }
    db = client.db(getEnvironmentVariable('COSMOS_DB_NAME'));
    db.collection(COLLECTIONS.USERS).find({}).forEach((doc: IUser) => {
      userInfoCache[doc.id] = {
        id: doc.id,
        name: doc.name,
        timezone: doc.timezone,
        contacts: doc.contacts
      };
    }, cb);
  });
}

export function getContacts(userId: string): IContact[] {
  return userInfoCache[userId].contacts;
}

export function setContacts(userId: string, contacts: IContact[], cb: CB): void {
  if (!userInfoCache[userId]) {
    throw new Error(`Unknown user ID ${userId}`);
  }
  // Save to MongoDB here
  userInfoCache[userId].contacts = contacts;
}
