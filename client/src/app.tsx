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

let registration: ServiceWorkerRegistration | undefined;
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Registering service worker');
  navigator.serviceWorker.register('/service-worker.js')
    .then((r) => {
      registration = r;
      console.log('Service worker registered');
      if ((Notification as any).permission === 'granted') {
        registerNotifications();
      }
    });
}

function registerNotifications() {
  if (!('PushManager' in window)) {
    console.error('This browser does not support push notifications');
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
      } else {
        console.log('Push notification registration complete');
        updateUI();
      }
    });
  }).catch((error) => {
    console.log(`Registration failed: ${error}`);
  });
}

function enableNotifications() {
  console.log('Registering for push notifications');
  Notification.requestPermission().then((permissionResult) => {
    if (permissionResult !== 'granted') {
      console.error('User did not grant permission for notifications');
      return;
    }
    registerNotifications();
  });
}

function createNotification() {
  request({
    endpoint: 'createNotification',
    method: 'POST'
  }, (err, result) => {
    if (err) {
      console.error(`Could not create subscription one the server: ${err}`);
    } else {
      console.log('Notification created');
    }
  });
}

function updateUI() {
  let button = (<button onClick={enableNotifications}>Enable Notifications</button>);
  if ((Notification as any).permission === 'granted') {
    button = (<button onClick={createNotification}>Create notification</button>);
  }

  render(
    (
      <div>
        {button}
      </div>
    ),
    document.getElementById('root')
  );
}
updateUI();
