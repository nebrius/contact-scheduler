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
import { IContact } from '../common/types';
import { EditContact } from './EditContact';
import * as classnames from 'classnames';

const NEW_CONTACT_TEMPLATE: IContact = {
  name: '',
  frequency: 'weekly',
  id: NaN
};

export interface IStateProps {
  contacts: IContact[];
}

export interface IDispatchProps {
  closeContacts: () => void;
  saveContact: (contact: IContact) => void;
  deleteContact: (contact: IContact) => void;
}

export type IProps = IStateProps & IDispatchProps;

interface IState {
  selectedContact: IContact | undefined;
}

export class ContactList extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedContact: props.contacts.length ? undefined : { ...NEW_CONTACT_TEMPLATE }
    };
  }

  public render() {
    let editContact: JSX.Element | undefined;
    let addButton: JSX.Element | undefined;
    if (this.state.selectedContact) {
      editContact = (
        <EditContact
          contact={this.state.selectedContact}
          isAdd={isNaN(this.state.selectedContact.id)}
          saveContact={this.saveContact}
          deleteContact={this.deleteContact}
          closeContact={this.closeContact}/>
      );
    } else {
      addButton = (
        <button className="btn btn-primary" onClick={this.createContact}>Add Contact</button>
      );
    }
    return (
      <div className="contact-list">
        <div className="contact-list-header">
          <button type="button" className="button contact-list-close-button" onClick={this.props.closeContacts}>←</button>
        </div>
        <div className="contact-list-contents">
          <div className="contact-list-contents-list-container">
            <div className="contact-list-contents-contacts">
              {this.props.contacts.map((contact) => (
                <button
                  className={classnames(
                    'contact-list-entry',
                    'button ',
                    { 'button-selected': contact === this.state.selectedContact }
                  )}
                  type="button"
                  key={contact.id}
                  onClick={() => this.openContact(contact)}
                >{contact.name}</button>
              ))}
            </div>
            <div className="contact-list-contents-add">
              {addButton}
            </div>
          </div>
          {editContact}
        </div>
      </div>
    );
  }

  private openContact = (contact: IContact) => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedContact: contact
      };
      return newState;
    });
  }

  private createContact = () => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedContact: { ...NEW_CONTACT_TEMPLATE }
      };
      return newState;
    });
  }

  private saveContact = (contact: IContact) => {
    this.props.saveContact(contact);
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedContact: undefined
      };
      return newState;
    });
  }

  private deleteContact = (contact: IContact) => {
    this.props.deleteContact(contact);
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedContact: undefined
      };
      return newState;
    });
  }

  private closeContact = () => {
    this.setState((previousState) => {
      const newState: IState = {
        ...previousState,
        selectedContact: undefined
      };
      return newState;
    });
  }
}
