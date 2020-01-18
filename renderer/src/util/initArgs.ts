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

import { IAppArguments, INotificationArguments } from '../common/arguments';

// The application initialization arguments are passed in as base64 encoded JSON
// We parse them here for the app to use

function parseArgs(): any {
  const rawInitArgs = (new URL(window.location.href)).searchParams.get('initArgs');
  if (typeof rawInitArgs !== 'string') {
    throw new Error('Internal Error: rawInitArgs is null');
  }
  return JSON.parse(atob(rawInitArgs));
}

export function getAppInitArgs(): IAppArguments {
  return parseArgs();
}

export function getNotificationInitArgs(): INotificationArguments {
  return parseArgs();
}
