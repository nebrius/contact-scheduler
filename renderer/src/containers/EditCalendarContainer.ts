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
import { ICalendar } from '../common/types';
import { ICalendarState } from '../util/types';
import { IAction } from '../actions/actions';
import { EditCalendar, IStateProps, IDispatchProps } from '../components/EditCalendar';
import { MessageTypes, ISaveCalendarMessage } from '../common/messages';

function mapStateToProps(state: ICalendarState): IStateProps {
  return {
    calendar: state.calendar,
    isAdd: state.isAdd
  };
}

function mapDispatchToProps(dispatch: (action: IAction) => any): IDispatchProps {
  return {
    saveCalendar: (calendar: ICalendar) => {
      const args: ISaveCalendarMessage = { calendar };
      ipcRenderer.send(MessageTypes.RequestSaveCalendar, JSON.stringify(args));
    },
    deleteCalendar: (calendar: ICalendar) => {
      // TODO: add confirmation flow
      // const args: IDeleteCalendarMessageArguments = { calendar };
      // ipcRenderer.send(MessageTypes.RequestDeleteCalendar, JSON.stringify(args));
    }
  };
}

export const EditCalendarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditCalendar);
