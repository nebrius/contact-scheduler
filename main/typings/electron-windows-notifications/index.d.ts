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

declare module 'electron-windows-notifications' {

  import { EventEmitter } from 'events';

  export interface IToastNotificationOptions {
    template?: string;
    strings?: string[];
    appId?: string;
    expirationTime?: Date;
    group?: string;
    tag?: string;
  }

  export class ToastNotification extends EventEmitter {
    constructor(options: IToastNotificationOptions);
    public show(): void;
    public hide(): void;
    public checkSettings (): void;
  }
}
