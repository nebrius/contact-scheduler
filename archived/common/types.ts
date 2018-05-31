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

export type CB = (err: Error | undefined) => void;
export type CBWithValue<T> = (err: Error | undefined, value: T | undefined) => void;

export enum Frequency {
  Weekly,
  Monthly,
  Quarterly
}

export interface IContact {
  name: string;
  url: string | null;
  frequency: Frequency;
  lastContacted: number;
  nextContact: number;
}

export interface IPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export interface IDailyBucket {
  timestamp: number;
  available: boolean;
}

export interface IUser {
  id: string;
  name: string;
  contacts: IContact[];
  settings: {
    timezone: string;
    startOfDay: number;
    endOfDay: number;
  };
  state: {
    dailyBucketsUpdated: number;
    dailyBuckets: IDailyBucket[];
    weeklyContactListUpdated: number;
    weeklyContactList: IContact[];
    subscription?: IPushSubscription;
  };
}
