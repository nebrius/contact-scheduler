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

import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { IAction } from '../actions/actions';
import { NotificationRoot, IStateProps, IDispatchProps } from '../components/NotificationRoot';
import { IContact } from '../common/types';
import { INotificationState } from '../util/types'
import { MessageTypes, IRespondMessage, IPushToBackMessage } from '../common/messages';

function mapStateToProps(state: INotificationState): IStateProps {
  return {
    contact: state.notification.contact
  };
}

function mapDispatchToProps(dispatch: (action: IAction) => any): IDispatchProps {
  return {
    close() {
      ipcRenderer.send(MessageTypes.CloseNotification);
    },
    respond(contact: IContact) {
      const args: IRespondMessage = { contact };
      ipcRenderer.send(MessageTypes.Respond, JSON.stringify(args));
    },
    pushToBack(contact: IContact) {
      const args: IPushToBackMessage = { contact };
      ipcRenderer.send(MessageTypes.PushToBack, JSON.stringify(args));
    }
  };
}

export const NotificationRootContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationRoot);
