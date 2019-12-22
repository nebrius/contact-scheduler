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
export const ACTIONS = {
    UPDATE_CALENDARS: 'UPDATE_CALENDARS',
    UPDATE_CONTACTS: 'UPDATE_CONTACTS',
    UPDATE_QUEUE: 'UPDATE_QUEUE',
    NAVIGATE_TO_HOME: 'NAVIGATE_TO_HOME',
    NAVIGATE_TO_CONTACTS: 'NAVIGATE_TO_CONTACTS',
    NAVIGATE_TO_CALENDARS: 'NAVIGATE_TO_CALENDARS',
    EDIT_CONTACT: 'EDIT_CONTACT'
};
export function updateCalendars(calendars) {
    return {
        calendars,
        type: ACTIONS.UPDATE_CALENDARS
    };
}
export function updateContacts(contacts) {
    return {
        contacts,
        type: ACTIONS.UPDATE_CONTACTS
    };
}
export function updateQueue(queue) {
    return {
        queue,
        type: ACTIONS.UPDATE_QUEUE
    };
}
// Actions for the home UI
export function navigateToHome() {
    return {
        type: ACTIONS.NAVIGATE_TO_HOME
    };
}
// Actions for the edit contacts UI
export function navigateToContacts() {
    return {
        type: ACTIONS.NAVIGATE_TO_CONTACTS
    };
}
export function editContact(contact) {
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
export function selectCalendarSource(source) {
    return {
        source,
        type: ACTIONS.NAVIGATE_TO_CALENDARS
    };
}
//# sourceMappingURL=actions.js.map