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

import { request } from './api';
import { urlBase64ToUint8Array } from './util';
import { CB } from '../common/types';

let registration: ServiceWorkerRegistration | undefined;

export function registerServiceWorker(cb: CB): void {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Registering service worker');
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((r) => {
        registration = r;
        console.log('Service worker registered');
        setTimeout(cb(undefined));
      })
      .catch((err) => setTimeout(cb));
  }
}

export function enableNotifications(cb: CB): void {
  console.log('Registering for push notifications');
  Notification.requestPermission()
    .then((permissionResult) => {
      if (permissionResult === 'granted') {
        cb(undefined);
        return;
      }
      const err = new Error('User did not grant permission for notifications');
      console.error(err.message);
      setTimeout(() => cb(err));
    })
    .catch((err) => setTimeout(() => cb(err)));
}

export function registerPushNotifications(cb: CB): void {
  if (!('PushManager' in window)) {
    console.error('This browser does not support push notifications');
    cb(new Error('This browser does not support push notifications'));
    return;
  }
  const pushPublicKeyMetaTag = document.getElementsByName('pushPublicKey')[0];
  if (!pushPublicKeyMetaTag) {
    throw new Error('Internal Error: public key missing in meta tag');
  }
  if (!registration) {
    throw new Error('Internal Error: registration became undefined');
  }
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array((pushPublicKeyMetaTag.attributes as any).value.value)
  }).then((pushSubscription) => {
    request({
      endpoint: 'pushSubscription',
      method: 'POST',
      body: pushSubscription
    }, (err, result) => {
      if (err) {
        console.error(`Could not send subscription to the server: ${err}`);
        setTimeout(() => cb(err as Error));
      } else {
        console.log('Push notification registration complete');
        setTimeout(() => cb(undefined));
      }
    });
  }).catch((err) => {
    console.log(`Registration failed: ${err}`);
    setTimeout(() => cb(err as Error));
  });
}
