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

import * as moment from 'moment-timezone';

export function getEnvironmentVariable(variable: string): string {
  const value = process.env[variable];
  if (typeof value !== 'string') {
    throw new Error(`Environment variable ${variable} is not defined`);
  }
  return value;
}

export function toStringWithPadding(value: number, digits: number): string {
  let convertedString = value.toString();
  while (convertedString.length < digits) {
    convertedString = '0' + convertedString;
  }
  return convertedString;
}

export function getStartOfToday(timezone: string): number {
  const now = moment().tz(timezone);
  const startOfDay = moment.tz(
    `${toStringWithPadding(now.year(), 4)
    }-${toStringWithPadding(now.month() + 1, 2)
    }-${toStringWithPadding(now.date(), 2)}`, timezone);
  return startOfDay.unix() * 1000;
}

export function getStartOfWeek(timezone: string): number {
  const start = new Date(getStartOfToday(timezone));
  return start.getTime() - start.getDay() * 24 * 60 * 60 * 1000;
}
