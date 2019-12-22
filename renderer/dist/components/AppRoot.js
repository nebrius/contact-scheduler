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
import { ContactQueueContainer } from '../containers/ContactQueueContainer';
import { WeeklyCalendarContainer } from '../containers/WeeklyCalendarContainer';
import { ContactsListContainer } from '../containers/ContactsListContainer';
import { CalendarsListContainer } from '../containers/CalendarsListContainer';
import { SideBarContainer } from '../containers/SideBarContainer';
export function AppRoot(props) {
    switch (props.tab) {
        case 'contacts':
            return (React.createElement("div", { className: "app-root-container" },
                React.createElement(SideBarContainer, null),
                React.createElement(ContactsListContainer, null)));
        case 'calendars':
            return (React.createElement("div", { className: "app-root-container" },
                React.createElement(SideBarContainer, null),
                React.createElement(CalendarsListContainer, null)));
        default:
            if (!props.hasContacts) {
                return (React.createElement("div", { className: "app-root-container" },
                    React.createElement(SideBarContainer, null),
                    React.createElement(NoContactsCTAContainer, null)));
            }
            return (React.createElement("div", { className: "app-root-container" },
                React.createElement(SideBarContainer, null),
                React.createElement(ContactQueueContainer, null),
                React.createElement(WeeklyCalendarContainer, null)));
    }
}
//# sourceMappingURL=AppRoot.js.map