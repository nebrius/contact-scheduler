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

import { CalendarSource, ICalendar, IContact } from '../common/types';

export const ACTIONS = {
  UPDATE_CALENDARS: 'UPDATE_CALENDARS',
  UPDATE_CONTACTS: 'UPDATE_CONTACTS',

  NAVIGATE_TO_HOME: 'NAVIGATE_TO_HOME',
  NAVIGATE_TO_CONTACTS: 'NAVIGATE_TO_CONTACTS',
  NAVIGATE_TO_CALENDARS: 'NAVIGATE_TO_CALENDARS',

  EDIT_CONTACT: 'EDIT_CONTACT'
};

export interface IAction {
  type: string;
}

// General state actions

export interface IUpdateCalendarsAction extends IAction {
  calendars: ICalendar[];
}
export function updateCalendars(calendars: ICalendar[]): IUpdateCalendarsAction {
  return {
    calendars,
    type: ACTIONS.UPDATE_CALENDARS
  };
}

export interface IUpdateContactsAction extends IAction {
  contacts: IContact[];
}
export function updateContacts(contacts: IContact[]): IUpdateContactsAction {
  return {
    contacts,
    type: ACTIONS.UPDATE_CONTACTS
  };
}

// Actions for the home UI

export function navigateToHome(): IAction {
  return {
    type: ACTIONS.NAVIGATE_TO_HOME
  };
}

// Actions for the edit contacts UI

export function navigateToContacts(): IAction {
  return {
    type: ACTIONS.NAVIGATE_TO_CONTACTS
  };
}

export interface IEditContactAction extends IAction {
  contact: IContact;
}
export function editContact(contact: IContact): IEditContactAction {
  return {
    contact,
    type: ACTIONS.EDIT_CONTACT
  };
}

// Actions for the edit calendars UI

export function navigateToCalendars() {
  return {
    type: ACTIONS.NAVIGATE_TO_CALENDARS
  };
}

export interface ISelectCalendarSourceAction extends IAction {
  source: CalendarSource;
}
export function selectCalendarSource(source: CalendarSource): ISelectCalendarSourceAction {
  return {
    source,
    type: ACTIONS.NAVIGATE_TO_CALENDARS
  };
}
