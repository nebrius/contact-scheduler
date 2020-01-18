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

import { render } from 'react-dom';
import { connectToInfrastructureServer, addMessageListener } from '@nebrius/electron-infrastructure-renderer';
import { AppRootContainer } from './containers/AppRootContainer';
import { INTERNAL_SERVER_PORT } from './common/config';
import {
  WindowTypes,
  MessageTypes,
  IUpdateCalendarsMessage,
  IUpdateContactsMessage,
  IUpdateQueueMessage
} from './common/messages';
import { ACTION_TYPES } from './util/types';
import { globalDispatch, createRoot } from 'redux-wiring';
import './reducers/appReducers';

(async () => {
  await connectToInfrastructureServer(WindowTypes.Main, INTERNAL_SERVER_PORT);
  addMessageListener((message) => {
    switch (message.messageType) {
      case MessageTypes.UpdateCalendars:
        const calendars = (message as IUpdateCalendarsMessage).calendars;
        globalDispatch(ACTION_TYPES.UPDATE_CALENDARS, calendars);
        break;

      case MessageTypes.UpdateContacts:
        const contacts = (message as IUpdateContactsMessage).contacts;
        globalDispatch(ACTION_TYPES.UPDATE_CONTACTS, contacts);
        break;

      case MessageTypes.UpdateQueue:
        const queue = (message as IUpdateQueueMessage).queue;
        globalDispatch(ACTION_TYPES.UPDATE_QUEUE, queue);
        break;
    }
  });
  render(
    createRoot(AppRootContainer),
    document.getElementById('root')
  );
})();
