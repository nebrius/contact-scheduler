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

import { join } from 'path';
import { readFileSync } from 'fs';

const bugUrl = JSON.parse(readFileSync(join(__dirname, '..', 'package.json')).toString()).bugs.url;

export function handleInternalError(message: string): Error {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(`Internal Error: ${message}`);
  } else {
    const msg = `Internal Error: ${message}. Please report this bug at ${bugUrl}`;
    error(msg);
    return new Error(msg);
  }
}

export function log(message: string): void {
  console.log(`${(new Date()).toLocaleString()}: ${message}`);
}

export function error(message: string | Error): void {
  console.error(`${(new Date()).toLocaleString()}: ${message}`);
}
