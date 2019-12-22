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
import { ACTIONS } from '../../actions/actions';
export function createCalendarsReducer(calendars) {
    const DEFAULT_STATE = calendars;
    return (state, action) => {
        if (!state) {
            state = DEFAULT_STATE;
        }
        switch (action.type) {
            case ACTIONS.UPDATE_CALENDARS:
                return [...action.calendars];
            default:
                return state;
        }
    };
}
//# sourceMappingURL=calendarsReducer.js.map