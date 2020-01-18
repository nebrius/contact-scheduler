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

import { createContainer } from 'redux-wiring';
import { STATE_TYPES, ACTION_TYPES } from '../util/types';
import { SideBar, IStateProps, IDispatchProps } from '../components/SideBar';

export const SideBarContainer = createContainer(
  (state): IStateProps => {
    return {
      activeTab: state.getState(STATE_TYPES.UI_STATE).tab
    };
  },
  (dispatch): IDispatchProps => {
    return {
      navigateToHome() {
        dispatch(ACTION_TYPES.NAVIGATE_TO_HOME);
      },
      navigateToContacts() {
        dispatch(ACTION_TYPES.NAVIGATE_TO_CONTACTS);
      },
      navigateToCalendars() {
        dispatch(ACTION_TYPES.NAVIGATE_TO_CALENDARS);
      }
    };
  },
  SideBar);
