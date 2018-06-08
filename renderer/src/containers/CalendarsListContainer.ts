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
import { IAppState } from '../util/types';
import { IAction, closeDialog } from '../actions/actions';
import { CalendarList, IStateProps, IDispatchProps } from '../components/CalendarList';
import { ICalendar } from '../common/types';
import { MessageTypes, ISaveCalendarMessage, IDeleteCalendarMessage } from '../common/messages';

function mapStateToProps(state: IAppState): IStateProps {
  return {
    calendars: state.calendars
  };
}

function mapDispatchToProps(dispatch: (action: IAction) => any): IDispatchProps {
  return {
    closeCalendars() {
      dispatch(closeDialog());
    },
    saveCalendar(calendar: ICalendar) {
      const args: ISaveCalendarMessage = { calendar };
      ipcRenderer.send(MessageTypes.RequestSaveCalendar, JSON.stringify(args));
    },
    deleteCalendar(calendar: ICalendar) {
      const args: IDeleteCalendarMessage = { calendar };
      ipcRenderer.send(MessageTypes.RequestDeleteCalendar, JSON.stringify(args));
    }
  };
}

export const CalendarsListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CalendarList);
