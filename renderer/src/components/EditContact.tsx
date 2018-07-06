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

import equals = require('deep-equal');

export interface IStateProps {
  contact: IContact;
  isAdd: boolean;
}

export interface IDispatchProps {
  saveContact: (contact: IContact) => void;
  deleteContact: (contact: IContact) => void;
  closeContact: () => void;
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
      <div key={this.props.contact.id} className="edit-contact-container">
        <h3 className="edit-contact-header">{this.props.isAdd ? 'New Contact' : 'Edit Contact'}</h3>
        <div className="edit-contact-data">
          <div>
            <label htmlFor="contactName">Name:</label>
          </div>
          <div>
            <input type="text" value={entry.name} onChange={this.onNameEdit} id="contactName" />
          </div>
          <div>
            <label htmlFor="contactFrequency">Frequency:</label>
          </div>
          <div>
            <input
              type="radio"
              id="contactFrequencyWeekly"
              name="contactFrequency"
              value="weekly"
              onChange={this.onFrequencyChange}
              checked={this.state.unsavedEntry.frequency === 'weekly'} />
            <label htmlFor="contactFrequencyWeekly">Weekly</label>
            <input
              type="radio"
              id="contactFrequencyMonthly"
              name="contactFrequency"
              value="monthly"
              onChange={this.onFrequencyChange}
              checked={this.state.unsavedEntry.frequency === 'monthly'} />
            <label htmlFor="contactFrequencyMonthly">Monthly</label>
            <input
              type="radio"
              id="contactFrequencyQuarterly"
              name="contactFrequency"
              value="quarterly"
              onChange={this.onFrequencyChange}
              checked={this.state.unsavedEntry.frequency === 'quarterly'} />
            <label htmlFor="contactFrequencyQuarterly">Quarterly</label>
          </div>
        </div>
        <div className="edit-contact-buttons">
          {deleteButton}
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={this.onSave}
            disabled={!this.props.isAdd && equals(this.props.contact, this.state.unsavedEntry)}
          >Save</button>
          <button type="button" className="btn btn-primary btn-lg" onClick={this.onCancel}>Cancel</button>
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

  private onFrequencyChange = (event: React.FormEvent<HTMLInputElement>) => {
    const frequency: any = event.currentTarget.value;
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        unsavedEntry: {
          ...previousState.unsavedEntry,
          frequency
        }
      };
      return newState;
    });
  }

  private onDelete = () => {
    if (window.confirm(`Are you sure you would like to delete ${this.props.contact.name} from your contacts list?`)) {
      this.props.deleteContact(this.props.contact);
    }
  }

  private onSave = () => {
    this.props.saveContact(this.state.unsavedEntry);
  }

  private onCancel = () => {
    this.props.closeContact();
  }
}
