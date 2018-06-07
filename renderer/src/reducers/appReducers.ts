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
import { createDailyContactQueueReducer } from './app/dailyContactQueueReducer';
import { createCalendarsReducer } from './app/calendarsReducer';
import { createUISteteReducer } from './app/uiSteteReducer';
import { IAppArguments } from '../common/arguments';

const initArgs: IAppArguments = JSON.parse(process.argv.pop() as string);

export const appReducers = combineReducers({
  contacts: createContactsReducer(initArgs.contacts),
  dailyContactQueue: createDailyContactQueueReducer(initArgs.dailyContactQueue),
  calendars: createCalendarsReducer(initArgs.calendars),
  uiState: createUISteteReducer()
});
