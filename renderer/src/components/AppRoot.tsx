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
import { NoContactsCTAContainer } from '../containers/NoContactsCTAContainer';
import { DailyContactQueueContainer } from '../containers/DailyContactQueueContainer';
import { WeeklyCalendarContainer } from '../containers/WeeklyCalendarContainer';
import { ContactsListContainer } from '../containers/ContactsListContainer';
import { CalendarsListContainer } from '../containers/CalendarsListContainer';

export interface IStateProps {
  hasContacts: boolean;
  dialog: undefined | 'contacts' | 'calendars';
}

export type IDispatchProps = {} // No dispatch props (yet?)

export type IProps = IStateProps & IDispatchProps;

export function AppRoot(props: IProps): JSX.Element {
  switch (props.dialog) {
    case 'contacts':
      return (
        <div className="app-root-container">
          <ContactsListContainer />
        </div>
      );
    case 'calendars':
      return (
        <div className="app-root-container">
          <CalendarsListContainer />
        </div>
      );
  }
  if (!props.hasContacts) {
    return (
      <NoContactsCTAContainer />
    );
  }
  return (
    <div className="app-root-container">
      <DailyContactQueueContainer />
      <WeeklyCalendarContainer />
    </div>
  );
}
