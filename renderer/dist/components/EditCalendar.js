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
export class EditCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.onSourceEdit = (source) => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    unsavedEntry: {
                        ...previousState.unsavedEntry,
                        source
                    }
                };
                return newState;
            });
        };
        this.onNameEdit = (event) => {
            const displayName = event.currentTarget.value;
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    unsavedEntry: {
                        ...previousState.unsavedEntry,
                        displayName
                    }
                };
                return newState;
            });
        };
        this.onDelete = () => {
            const msg = `Are you sure you would like to delete ${this.props.calendar.displayName} from your contacts list?`;
            if (window.confirm(msg)) {
                this.props.deleteCalendar(this.props.calendar);
            }
        };
        this.onSave = () => {
            this.props.saveCalendar(this.state.unsavedEntry);
        };
        this.onCancel = () => {
            this.props.closeCalendar();
        };
        this.state = {
            unsavedEntry: this.props.calendar
        };
    }
    render() {
        const entry = this.state.unsavedEntry;
        let deleteButton = undefined;
        let saveButton = undefined;
        let contents = undefined;
        if (!this.props.isAdd) {
            deleteButton = (React.createElement("button", { type: "button", className: "btn btn-danger btn-lg", onClick: this.onDelete }, "Delete"));
        }
        if (this.props.isAdd && !this.state.unsavedEntry.source) {
            contents = (React.createElement("div", { className: "edit-calendar-data-source" },
                React.createElement("button", { type: "button", className: "btn btn-primary btn-lg", onClick: () => this.onSourceEdit('office365') }, "Office 365"),
                React.createElement("button", { type: "button", className: "btn btn-primary btn-lg", onClick: () => this.onSourceEdit('google') }, "Google")));
        }
        else {
            contents = (React.createElement("div", { className: "edit-calendar-data" },
                React.createElement("div", null,
                    React.createElement("span", null, "Name:")),
                React.createElement("div", null,
                    React.createElement("input", { type: "text", value: entry.displayName, onChange: this.onNameEdit }))));
            saveButton = (React.createElement("button", { type: "button", className: "btn btn-primary btn-lg", onClick: this.onSave, disabled: !this.props.isAdd && equals(this.props.calendar, this.state.unsavedEntry) }, "Save"));
        }
        return (React.createElement("div", { className: "edit-calendar-container" },
            React.createElement("h3", { className: "edit-contact-header" }, this.props.isAdd ? 'New Calendar' : 'Edit Calendar'),
            contents,
            React.createElement("div", { className: "edit-calendar-buttons" },
                deleteButton,
                saveButton,
                React.createElement("button", { type: "button", className: "btn btn-primary btn-lg", onClick: this.onCancel }, "Cancel"))));
    }
}
//# sourceMappingURL=EditCalendar.js.map