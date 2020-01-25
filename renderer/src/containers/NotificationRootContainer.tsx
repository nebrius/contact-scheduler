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

import { createContainer } from 'reduxology';
import { sendMessage } from '@nebrius/electron-infrastructure-renderer';
import { NotificationRoot, IStateProps, IDispatchProps } from '../components/NotificationRoot';
import { IContact } from '../common/types';
import { STATE_TYPES } from '../util/types'
import { MessageTypes, IRespondMessage, IPushToBackMessage } from '../common/messages';

export const NotificationRootContainer = createContainer(
  (getSlice): IStateProps => {
    return {
      contact: getSlice(STATE_TYPES.NOTIFICATIONS).contact
    };
  },
  (dispatch): IDispatchProps => {
    return {
      close() {
        sendMessage({
          messageType: MessageTypes.CloseNotification
        });
      },
      respond(contact: IContact) {
        const message: IRespondMessage = {
          messageType: MessageTypes.Respond,
          contact
        };
        sendMessage(message);
      },
      pushToBack(contact: IContact) {
        const message: IPushToBackMessage = {
          messageType: MessageTypes.PushToBack,
          contact
        };
        sendMessage(message);
      }
    };
  },
  NotificationRoot);
