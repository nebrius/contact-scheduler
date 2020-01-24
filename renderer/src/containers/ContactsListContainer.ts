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
import { STATE_TYPES } from '../util/types';
import { ContactList, IStateProps, IDispatchProps } from '../components/ContactList';
import { IContact } from '../common/types';
import { MessageTypes, ISaveContactMessage, IDeleteContactMessage } from '../common/messages';

export const ContactsListContainer = createContainer(
  (state): IStateProps => {
    return {
      contacts: state.getSlice(STATE_TYPES.CONTACTS)
    };
  },
  (dispatch): IDispatchProps => {
    return {
      saveContact(contact: IContact) {
        const message: ISaveContactMessage = {
          messageType: MessageTypes.RequestSaveContact,
          contact
        };
        sendMessage(message);
      },
      deleteContact(contact: IContact) {
        const message: IDeleteContactMessage = {
          messageType: MessageTypes.RequestDeleteContact,
          contact
        };
        sendMessage(message);
      }
    };
  },
  ContactList);
