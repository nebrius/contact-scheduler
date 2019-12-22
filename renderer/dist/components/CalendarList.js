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
import { EditCalendar } from './EditCalendar';
import * as classnames from 'classnames';
const NEW_CALENDAR_TEMPLATE = {
    displayName: '',
    source: undefined,
    id: NaN
};
export class CalendarList extends React.Component {
    constructor(props) {
        super(props);
        this.openCalendar = (calendar) => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedCalendar: calendar
                };
                return newState;
            });
        };
        this.createCalendar = () => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedCalendar: { ...NEW_CALENDAR_TEMPLATE }
                };
                return newState;
            });
        };
        this.saveCalendar = (calendar) => {
            this.props.saveCalendar(calendar);
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedCalendar: undefined
                };
                return newState;
            });
        };
        this.deleteCalendar = (calendar) => {
            this.props.deleteCalendar(calendar);
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedCalendar: undefined
                };
                return newState;
            });
        };
        this.closeCalendar = () => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedCalendar: undefined
                };
                return newState;
            });
        };
        this.state = {
            selectedCalendar: props.calendars.length ? undefined : { ...NEW_CALENDAR_TEMPLATE }
        };
    }
    render() {
        let editCalendar;
        let addButton;
        if (this.state.selectedCalendar) {
            editCalendar = (React.createElement(EditCalendar, { calendar: this.state.selectedCalendar, isAdd: isNaN(this.state.selectedCalendar.id), saveCalendar: this.saveCalendar, deleteCalendar: this.deleteCalendar, closeCalendar: this.closeCalendar }));
        }
        else {
            addButton = (React.createElement("button", { className: "btn btn-primary", onClick: this.createCalendar }, "Add Calendar"));
        }
        return (React.createElement("div", { className: "calendar-list" },
            React.createElement("div", { className: "calendar-list-contents-list-container" },
                React.createElement("div", { className: "calendar-list-contents-calendars" }, this.props.calendars.map((calendar) => (React.createElement("button", { className: classnames('calendar-list-entry', 'button ', { 'button-selected': calendar === this.state.selectedCalendar }), type: "button", key: calendar.id, onClick: () => this.openCalendar(calendar) }, calendar.displayName)))),
                React.createElement("div", { className: "calendar-list-contents-add" }, addButton)),
            editCalendar));
    }
}
//# sourceMappingURL=CalendarList.js.map