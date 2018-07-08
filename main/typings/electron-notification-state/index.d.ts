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

declare module 'electron-notification-state' {
  export function getDoNotDisturb(): boolean;
  export function getSessionState():
    '' |
    'SESSION_SCREEN_IS_LOCKED' |
    'SESSION_ON_CONSOLE_KEY' |
    'QUNS_NOT_PRESENT' |
    'QUNS_BUSY' |
    'QUNS_RUNNING_D3D_FULL_SCREEN' |
    'QUNS_PRESENTATION_MODE' |
    'QUNS_ACCEPTS_NOTIFICATIONS' |
    'QUNS_QUIET_TIME' |
    'QUNS_APP';
}
