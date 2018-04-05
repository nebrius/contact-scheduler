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
import { render } from 'react-dom';
import { request } from './util/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = ('=' as any).repeat((4 - base64String.length % 4) % 4);
  const rawData = window.atob((base64String + padding).replace(/\-/g, '+').replace(/_/g, '/'));
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Registering service worker');
    Notification.requestPermission().then((permissionResult) => {
      if (permissionResult !== 'granted') {
        console.error('User did not grant permission for notifications');
        return;
      }
      const pushPublicKeyMetaTag = document.getElementsByName('pushPublicKey')[0];
      if (!pushPublicKeyMetaTag) {
        throw new Error('Internal Error: public key missing in meta tag');
      }
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array((pushPublicKeyMetaTag.attributes as any).value.value)
        }))
        .then((pushSubscription) => {
          request({
            endpoint: 'pushSubscription',
            method: 'POST',
            body: pushSubscription
          }, (err, result) => {
            if (err) {
              console.error(`Could not send subscription to the server: ${err}`);
            } else {
              console.log('Push notification registration complete');
            }
          });
        })
        .catch((error) => {
          console.log(`Registration failed: ${error}`);
        });
    });
  } else {
    console.error('This browser does not support service workers and/or push notifications');
  }
}

render(
  (
    <div>
      <button onClick={registerServiceWorker}>Register Service Worker</button>
    </div>
  ),
  document.getElementById('root')
);
