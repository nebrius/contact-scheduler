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

import { createStore } from 'redux';
import { IAppState } from './types';
import { reducers } from '../reducers/reducers';

const userTag = document.getElementsByName('user')[0];
if (!userTag) {
  throw new Error('Internal Error: user missing in meta tag');
}
const user = JSON.parse((userTag.attributes as any).value.value);

const preloadedState: IAppState = {
  user,
  state: {
    notificationsEnabled: (Notification as any).permission === 'granted',
    serviceWorkerRegistered: false
  }
};

export const store = createStore(reducers, preloadedState);
