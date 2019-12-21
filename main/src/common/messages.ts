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

import { ICalendar, IContact } from './types';

export const MessageTypes = {
  RequestAddCalendar: 'RequestAddCalendar',
  RequestEditCalendar: 'RequestEditCalendar',
  RequestSaveCalendar: 'RequestSaveCalendar',
  RequestDeleteCalendar: 'RequestDeleteCalendar',

  RequestAddContact: 'RequestAddContact',
  RequestEditContact: 'RequestEditContact',
  RequestSaveContact: 'RequestSaveContact',
  RequestDeleteContact: 'RequestDeleteContact',

  CloseDialog: 'CloseDialog',

  UpdateContacts: 'UpdateContacts',
  UpdateCalendars: 'UpdateCalendars',
  UpdateQueue: 'UpdateQueue',

  CloseNotification: 'CloseNotification',
  Respond: 'Respond',
  PushToBack: 'PushToBack'
};

export interface ISaveContactMessage {
  contact: IContact;
}

export interface IDeleteContactMessage {
  contact: IContact;
}

export interface ISaveCalendarMessage {
  calendar: ICalendar;
}

export interface IDeleteCalendarMessage {
  calendar: ICalendar;
}

export interface IRespondMessage {
  contact: IContact;
}

export interface IPushToBackMessage {
  contact: IContact;
}