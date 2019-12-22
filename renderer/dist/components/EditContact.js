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
export class EditContact extends React.Component {
    constructor(props) {
        super(props);
        this.onNameEdit = (event) => {
            const name = event.currentTarget.value;
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    unsavedEntry: {
                        ...previousState.unsavedEntry,
                        name
                    }
                };
                return newState;
            });
        };
        this.onFrequencyChange = (event) => {
            const frequency = event.currentTarget.value;
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    unsavedEntry: {
                        ...previousState.unsavedEntry,
                        frequency
                    }
                };
                return newState;
            });
        };
        this.onDelete = () => {
            if (window.confirm(`Are you sure you would like to delete ${this.props.contact.name} from your contacts list?`)) {
                this.props.deleteContact(this.props.contact);
            }
        };
        this.onSave = () => {
            this.props.saveContact(this.state.unsavedEntry);
        };
        this.onCancel = () => {
            this.props.closeContact();
        };
        this.state = {
            unsavedEntry: this.props.contact
        };
    }
    render() {
        const entry = this.state.unsavedEntry;
        let deleteButton = undefined;
        if (!this.props.isAdd) {
            deleteButton = (React.createElement("button", { type: "button", className: "btn btn-danger btn-lg", onClick: this.onDelete }, "Delete"));
        }
        return (React.createElement("div", { key: this.props.contact.id, className: "edit-contact-container" },
            React.createElement("h3", { className: "edit-contact-header" }, this.props.isAdd ? 'New Contact' : 'Edit Contact'),
            React.createElement("div", { className: "edit-contact-data" },
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "contactName" }, "Name:")),
                React.createElement("div", null,
                    React.createElement("input", { type: "text", value: entry.name, onChange: this.onNameEdit, id: "contactName" })),
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "contactFrequency" }, "Frequency:")),
                React.createElement("div", null,
                    React.createElement("input", { type: "radio", id: "contactFrequencyWeekly", name: "contactFrequency", value: "weekly", onChange: this.onFrequencyChange, checked: this.state.unsavedEntry.frequency === 'weekly' }),
                    React.createElement("label", { htmlFor: "contactFrequencyWeekly" }, "Weekly"),
                    React.createElement("input", { type: "radio", id: "contactFrequencyMonthly", name: "contactFrequency", value: "monthly", onChange: this.onFrequencyChange, checked: this.state.unsavedEntry.frequency === 'monthly' }),
                    React.createElement("label", { htmlFor: "contactFrequencyMonthly" }, "Monthly"),
                    React.createElement("input", { type: "radio", id: "contactFrequencyQuarterly", name: "contactFrequency", value: "quarterly", onChange: this.onFrequencyChange, checked: this.state.unsavedEntry.frequency === 'quarterly' }),
                    React.createElement("label", { htmlFor: "contactFrequencyQuarterly" }, "Quarterly"))),
            React.createElement("div", { className: "edit-contact-buttons" },
                deleteButton,
                React.createElement("button", { type: "button", className: "btn btn-primary btn-lg", onClick: this.onSave, disabled: !this.props.isAdd && equals(this.props.contact, this.state.unsavedEntry) }, "Save"),
                React.createElement("button", { type: "button", className: "btn btn-primary btn-lg", onClick: this.onCancel }, "Cancel"))));
    }
}
//# sourceMappingURL=EditContact.js.map