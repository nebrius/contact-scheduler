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

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('push', (event) => {
  const { data } = event as any;
  const promiseChain = ((self as any).registration as ServiceWorkerRegistration).showNotification(data.text());
  (event as any).waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event: any) => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil((self as any).clients.matchAll({
    type: 'window'
  }).then((clientList: any) => {
    for (const client of clientList) {
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if ((self as any).clients.openWindow) {
      return (self as any).clients.openWindow('/');
    }
  }));
});
