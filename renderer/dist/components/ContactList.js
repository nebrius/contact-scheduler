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
import { EditContact } from './EditContact';
import * as classnames from 'classnames';
const NEW_CONTACT_TEMPLATE = {
    name: '',
    frequency: 'weekly',
    id: NaN,
    lastContacted: 1
};
export class ContactList extends React.Component {
    constructor(props) {
        super(props);
        this.openContact = (contact) => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedContact: contact
                };
                return newState;
            });
        };
        this.createContact = () => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedContact: { ...NEW_CONTACT_TEMPLATE }
                };
                return newState;
            });
        };
        this.saveContact = (contact) => {
            this.props.saveContact(contact);
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedContact: undefined
                };
                return newState;
            });
        };
        this.deleteContact = (contact) => {
            this.props.deleteContact(contact);
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedContact: undefined
                };
                return newState;
            });
        };
        this.closeContact = () => {
            this.setState((previousState) => {
                const newState = {
                    ...previousState,
                    selectedContact: undefined
                };
                return newState;
            });
        };
        this.state = {
            selectedContact: props.contacts.length ? undefined : { ...NEW_CONTACT_TEMPLATE }
        };
    }
    render() {
        let editContact;
        let addButton;
        if (this.state.selectedContact) {
            editContact = (React.createElement(EditContact, { contact: this.state.selectedContact, isAdd: isNaN(this.state.selectedContact.id), saveContact: this.saveContact, deleteContact: this.deleteContact, closeContact: this.closeContact }));
        }
        else {
            addButton = (React.createElement("button", { className: "btn btn-primary", onClick: this.createContact }, "Add Contact"));
        }
        return (React.createElement("div", { className: "contact-list" },
            React.createElement("div", { className: "contact-list-contents-list-container" },
                React.createElement("div", { className: "contact-list-contents-contacts" }, this.props.contacts.map((contact) => (React.createElement("button", { className: classnames('contact-list-entry', 'button ', { 'button-selected': contact === this.state.selectedContact }), type: "button", key: contact.id, onClick: () => this.openContact(contact) }, contact.name)))),
                React.createElement("div", { className: "contact-list-contents-add" }, addButton)),
            editContact));
    }
}
//# sourceMappingURL=ContactList.js.map