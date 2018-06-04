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
import { IContact } from '../common/types';
import { IContactState } from '../util/types';
import { IAction } from '../actions/actions';
import { EditContact, IStateProps, IDispatchProps } from '../components/EditContact';
import { MessageTypes } from '../common/messages';
import {
  ISaveContactMessageArguments
} from '../common/arguments';

function mapStateToProps(state: IContactState): IStateProps {
  return {
    contact: state.contact,
    isAdd: state.isAdd
  };
}

function mapDispatchToProps(dispatch: (action: IAction) => any): IDispatchProps {
  return {
    saveContact: (contact: IContact) => {
      const args: ISaveContactMessageArguments = { contact };
      ipcRenderer.send(MessageTypes.RequestSaveContact, JSON.stringify(args));
    },
    deleteContact: (contact: IContact) => {
      // TODO: add confirmation flow
      // const args: IDeleteContactMessageArguments = { contact };
      // ipcRenderer.send(MessageTypes.RequestDeleteContact, JSON.stringify(args));
    }
  };
}

export const EditContactContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContact);
