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

import * as React from 'react';
import { IContact } from '../common/types';

export interface IStateProps {
  contact: IContact;
  isAdd: boolean;
}

export interface IDispatchProps {
  saveContact: (contact: IContact) => void;
  deleteContact: (contact: IContact) => void;
}

export type IProps = IStateProps & IDispatchProps;

interface IState {
  unsavedEntry: IContact
}

export class EditContact extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      unsavedEntry: this.props.contact
    };
  }

  public render() {
    const entry = this.state.unsavedEntry;
    let deleteButton: JSX.Element | undefined = undefined;
    if (!this.props.isAdd) {
      deleteButton = (
        <button type="button" className="btn btn-danger btn-lg" onClick={this.onDelete}>Delete</button>
      );
    }
    return (
      <div className="edit-contact-container">
        <div className="edit-contact-data">
          <div>
            <span>Name:</span>
          </div>
          <div>
            <input type="text" value={entry.name} onChange={this.onNameEdit} />
          </div>
        </div>
        <div className="edit-contact-buttons">
          {deleteButton}
          <button type="button" className="btn btn-primary btn-lg" onClick={this.onSave}>Save</button>
        </div>
      </div>
    );
  }

  private onNameEdit = (event: React.FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.value;
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        unsavedEntry: {
          ...previousState.unsavedEntry,
          name
        }
      };
      return newState;
    });
  }

  private onDelete = () => {
    this.props.deleteContact(this.props.contact);
  }

  private onSave = () => {
    this.props.saveContact(this.state.unsavedEntry);
  }
}