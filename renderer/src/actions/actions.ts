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
  SELECT_CALENDAR_SOURCE: 'SELECT_CALENDAR_SOURCE',
  UPDATE_CALENDARS: 'UPDATE_CALENDARS',
  UPDATE_CONTACTS: 'UPDATE_CONTACTS'
};

export interface IAction {
  type: string;
}

export interface ISelectCalendarAction extends IAction {
  source: CalendarSource;
}
export function selectCalendarSource(source: CalendarSource): ISelectCalendarAction {
  return {
    source,
    type: ACTIONS.SELECT_CALENDAR_SOURCE
  };
}

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
