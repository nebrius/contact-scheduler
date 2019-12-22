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

import { createStore } from 'redux';
import { addMessageListener } from '@nebrius/electron-infrastructure-renderer';
import { appReducers } from '../reducers/appReducers';
import { MessageTypes } from '../common/messages';
import { IUpdateCalendarsMessage, IUpdateContactsMessage, IUpdateQueueMessage } from '../common/messages';
import { updateCalendars, updateContacts, updateQueue } from '../actions/actions';

export const appStore = createStore(appReducers);

addMessageListener((message) => {
  switch (message.messageType) {
    case MessageTypes.UpdateCalendars:
      const calendars = (message as IUpdateCalendarsMessage).calendars;
      appStore.dispatch(updateCalendars(calendars));
      break;

    case MessageTypes.UpdateContacts:
      const contacts = (message as IUpdateContactsMessage).contacts;
      appStore.dispatch(updateContacts(contacts));
      break;

    case MessageTypes.UpdateQueue:
      const queue = (message as IUpdateQueueMessage).queue;
      appStore.dispatch(updateQueue(queue));
      break;
  }
});
