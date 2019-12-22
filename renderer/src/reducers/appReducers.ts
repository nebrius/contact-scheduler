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

import { combineReducers } from 'redux';
import { createContactsReducer } from './app/contactsReducer';
import { createContactQueueReducer } from './app/contactQueueReducer';
import { createCalendarsReducer } from './app/calendarsReducer';
import { createUIStateReducer } from './app/uiStateReducer';
import { IAppArguments } from '../common/arguments';

// The application initialization arguments are passed in as base64 encoded JSON,
// and we want to parse it here
const rawInitArgs = (new URL(window.location.href)).searchParams.get('initArgs');
if (typeof rawInitArgs !== 'string') {
  throw new Error('Internal Error: rawInitArgs is null');
}
const initArgs: IAppArguments = JSON.parse(atob(rawInitArgs));

export const appReducers = combineReducers({
  contacts: createContactsReducer(initArgs.contacts),
  contactQueue: createContactQueueReducer(initArgs.contactQueue),
  calendars: createCalendarsReducer(initArgs.calendars),
  uiState: createUIStateReducer()
});
