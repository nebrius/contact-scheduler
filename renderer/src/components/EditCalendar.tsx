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
import { ICalendar, CalendarSource } from '../common/types';

import equals = require('fast-deep-equal');

export interface IStateProps {
  calendar: ICalendar;
  isAdd: boolean;
}

export interface IDispatchProps {
  saveCalendar: (calendar: ICalendar) => void;
  deleteCalendar: (calendar: ICalendar) => void;
  closeCalendar: () => void;
}

export type IProps = IStateProps & IDispatchProps;

interface IState {
  unsavedEntry: ICalendar
}

export class EditCalendar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      unsavedEntry: this.props.calendar
    };
  }

  public render() {
    const entry = this.state.unsavedEntry;
    let deleteButton: JSX.Element | undefined = undefined;
    let saveButton: JSX.Element | undefined = undefined;
    let contents: JSX.Element | undefined = undefined;
    if (!this.props.isAdd) {
      deleteButton = (
        <button type="button" className="btn btn-danger btn-lg" onClick={this.onDelete}>Delete</button>
      );
    }
    if (this.props.isAdd && !this.state.unsavedEntry.source) {
      contents = (
        <div className="edit-calendar-data-source">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => this.onSourceEdit('office365')}>
            Office 365
          </button>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => this.onSourceEdit('google')}>
            Google
          </button>
        </div>
      );
    } else {
      contents = (
        <div className="edit-calendar-data">
          <div>
            <span>Name:</span>
          </div>
          <div>
            <input type="text" value={entry.displayName} onChange={this.onNameEdit} />
          </div>
        </div>
      );
      saveButton = (
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={this.onSave}
          disabled={!this.props.isAdd && equals(this.props.calendar, this.state.unsavedEntry)}
        >Save</button>
      );
    }
    return (
      <div className="edit-calendar-container">
        <h3 className="edit-contact-header">{this.props.isAdd ? 'New Calendar' : 'Edit Calendar'}</h3>
        {contents}
        <div className="edit-calendar-buttons">
          {deleteButton}
          {saveButton}
          <button type="button" className="btn btn-primary btn-lg" onClick={this.onCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  private onSourceEdit = (source: CalendarSource) => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        unsavedEntry: {
          ...previousState.unsavedEntry,
          source
        }
      };
      return newState;
    });
  }

  private onNameEdit = (event: React.FormEvent<HTMLInputElement>) => {
    const displayName = event.currentTarget.value;
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        unsavedEntry: {
          ...previousState.unsavedEntry,
          displayName
        }
      };
      return newState;
    });
  }

  private onDelete = () => {
    const msg = `Are you sure you would like to delete ${this.props.calendar.displayName} from your contacts list?`;
    if (window.confirm(msg)) {
      this.props.deleteCalendar(this.props.calendar);
    }
  }

  private onSave = () => {
    this.props.saveCalendar(this.state.unsavedEntry);
  }

  private onCancel = () => {
    this.props.closeCalendar();
  }
}
