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

import { createReducer } from 'reduxology';
import { IUIState } from '../../util/types';
import { STATE_TYPES, ACTION_TYPES } from '../../util/types';

const initData: IUIState = {
  tab: 'home'
};
createReducer(STATE_TYPES.UI_STATE, initData)
  .handle(ACTION_TYPES.NAVIGATE_TO_HOME, (state: IUIState) => {
    state.tab = 'home';
  })
  .handle(ACTION_TYPES.NAVIGATE_TO_CONTACTS, (state: IUIState) => {
    state.tab = 'contacts';
  })
  .handle(ACTION_TYPES.NAVIGATE_TO_CALENDARS, (state: IUIState) => {
    state.tab = 'calendars';
  });
