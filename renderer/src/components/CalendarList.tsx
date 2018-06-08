/*
Copyright (C) 2018 Bryan Hughes <bryan@nebri.us>

Calendar Schedular is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Calendar Schedular is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Calendar Schedular.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as React from 'react';
import { ICalendar } from '../common/types';
import { EditCalendar } from './EditCalendar';
import * as classnames from 'classnames';

const NEW_CALENDAR_TEMPLATE: ICalendar = {
  displayName: '',
  source: undefined,
  id: NaN
};

export interface IStateProps {
  calendars: ICalendar[];
}

export interface IDispatchProps {
  closeCalendars: () => void;
  saveCalendar: (calendar: ICalendar) => void;
  deleteCalendar: (calendar: ICalendar) => void;
}

export type IProps = IStateProps & IDispatchProps;

interface IState {
  selectedCalendar: ICalendar | undefined;
}

export class CalendarList extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedCalendar: props.calendars.length ? undefined : { ...NEW_CALENDAR_TEMPLATE }
    };
  }

  public render() {
    let editCalendar: JSX.Element | undefined;
    let addButton: JSX.Element | undefined;
    if (this.state.selectedCalendar) {
      editCalendar = (
        <EditCalendar
          calendar={this.state.selectedCalendar}
          isAdd={isNaN(this.state.selectedCalendar.id)}
          saveCalendar={this.saveCalendar}
          deleteCalendar={this.deleteCalendar}
          closeCalendar={this.closeCalendar} />
      );
    } else {
      addButton = (
        <button className="btn btn-primary" onClick={this.createCalendar}>Add Calendar</button>
      );
    }
    return (
      <div className="calendar-list">
        <div className="calendar-list-header">
          <button type="button" className="button calendar-list-close-button" onClick={this.props.closeCalendars}>
            <i className="fas fa-arrow-circle-left 2x"></i>
          </button>
        </div>
        <div className="calendar-list-contents">
          <div className="calendar-list-contents-list-container">
            <div className="calendar-list-contents-calendars">
              {this.props.calendars.map((calendar) => (
                <button
                  className={classnames(
                    'calendar-list-entry',
                    'button ',
                    { 'button-selected': calendar === this.state.selectedCalendar }
                  )}
                  type="button"
                  key={calendar.id}
                  onClick={() => this.openCalendar(calendar)}
                >{calendar.displayName}</button>
              ))}
            </div>
            <div className="calendar-list-contents-add">
              {addButton}
            </div>
          </div>
          {editCalendar}
        </div>
      </div>
    );
  }

  private openCalendar = (calendar: ICalendar) => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedCalendar: calendar
      };
      return newState;
    });
  }

  private createCalendar = () => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedCalendar: { ...NEW_CALENDAR_TEMPLATE }
      };
      return newState;
    });
  }

  private saveCalendar = (calendar: ICalendar) => {
    this.props.saveCalendar(calendar);
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedCalendar: undefined
      };
      return newState;
    });
  }

  private deleteCalendar = (calendar: ICalendar) => {
    this.props.deleteCalendar(calendar);
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedCalendar: undefined
      };
      return newState;
    });
  }

  private closeCalendar = () => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedCalendar: undefined
      };
      return newState;
    });
  }
}
