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

import { join } from 'path';
import * as express from 'express';
import { json } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { Authenticator } from 'express-facebook-auth';
import { parallel, series } from 'async';
import { setVapidDetails, sendNotification } from 'web-push';
import { CB, IDailyBucket, IContact, Frequency } from './common/types';
import { getEnvironmentVariable, getStartOfToday, getStartOfWeek } from './util';
import {
  isUserRegistered,
  getUsers,
  getPushSubscription,
  setPushSubscription,
  getContacts,
  setContacts,
  setDailyBuckets,
  setWeeklyContactList
} from './db';

interface IRequest extends express.Request {
  userId: string;
}

const DEFAULT_PORT = 3000;
const HOUR_IN_MS = 60 * 60 * 1000;
const BUCKET_DURATION = HOUR_IN_MS;
const MONTHLY_THRESHOLD = HOUR_IN_MS * 24 * 25;
const QUARTERLY_THRESHOLD = HOUR_IN_MS * 24 * 80;

export function init(cb: CB): void {

  const port = process.env.PORT || DEFAULT_PORT;

  function getRedirectUri(): string {
    return process.env.NODE_ENV === 'production'
      ? `${getEnvironmentVariable('SERVER_HOST')}/login-success/`
      : `http://localhost:${port}/login-success/`;
  }

  setVapidDetails(
    'mailto:bryan@nebri.us',
    getEnvironmentVariable('PUSH_PUBLIC_KEY'),
    getEnvironmentVariable('PUSH_PRIVATE_KEY')
  );

  const app = express();

  app.use(json());
  app.use(cookieParser());

  if (process.env.HOST_CLIENT === 'true') {
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(join(__dirname, '..', 'client')));
    } else {
      app.use(express.static(join(__dirname, '..', '..', 'client', 'dist')));
    }
  }

  app.set('view engine', 'pug');
  app.set('views', join(__dirname, '..', 'views'));

  const auth = new Authenticator({
    facebookAppId: getEnvironmentVariable('FACEBOOK_APP_ID'),
    facebookAppSecret: getEnvironmentVariable('FACEBOOK_APP_SECRET'),
    isUserRegistered,
    loginUri: '/login',
    redirectUri: getRedirectUri()
  });

  app.get('/login', (req, res) => {
    console.log('endpoints: Serving GET:/login');
    res.render('login', {
      facebookAppId: getEnvironmentVariable('FACEBOOK_APP_ID'),
      redirectUri: getRedirectUri()
    });
  });

  auth.createLoginSuccessEndpoint(app);

  app.get('/', auth.createMiddleware(true), (req, res) => {
    console.log('endpoints: Serving GET:/');
    res.render('index', {
      pushPublicKey: getEnvironmentVariable('PUSH_PUBLIC_KEY')
    });
  });

  app.get('/notificationClicked', auth.createMiddleware(true), (req, res) => {
    res.send('You clicked a notification!');
  });

  app.get('/api/contacts', auth.createMiddleware(false), (req, res) => {
    console.log('endpoints: Serving GET:/api/contacts');
    res.send(getContacts((req as IRequest).userId));
  });

  app.post('/api/contacts', auth.createMiddleware(false), (req, res) => {
    console.log('endpoints: Serving POST:/api/contacts');
    const { userId, body: { contacts } } = req as IRequest;
    console.log(userId, contacts);
    setContacts(userId, contacts, (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send({ status: 'ok' });
      }
    });
  });

  app.post('/api/pushSubscription', auth.createMiddleware(false), (req, res) => {
    console.log('endpoints: Serving POST:/api/pushSubscription');
    const { userId, body: pushSubscription } = req as IRequest;
    setPushSubscription(userId, pushSubscription, (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send({ status: 'ok' });
      }
    });
  });

  app.post('/api/processNotifications', (req, res) => {
    const users = getUsers();
    parallel(users.map((user) => (next: CB) => {
      const midnight = getStartOfToday(user.settings.timezone);
      // const dayOfWeek = (new Date(midnight)).getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) {
      //   console.log('skipping due to the weekend');
      //   next(undefined);
      //   return;
      // }
      series([
        (weeklyContactListNext) => {
          if (user.state.weeklyContactListUpdated > getStartOfWeek(user.settings.timezone)) {
            weeklyContactListNext();
            return;
          }
          console.log('Creating the list of people to contact');
          const peopleToContact: IContact[] = [];
          for (const contact of user.contacts) {
            switch (contact.frequency) {
              case Frequency.Weekly:
                peopleToContact.push(contact);
                break;
              case Frequency.Monthly:
                if (contact.lastContacted + MONTHLY_THRESHOLD < midnight) {
                  peopleToContact.push(contact);
                }
                break;
              case Frequency.Quarterly:
                if (contact.lastContacted + QUARTERLY_THRESHOLD < midnight) {
                  peopleToContact.push(contact);
                }
                break;
            }
          }
          const shuffledPeopleToContact: IContact[] = [];
          while (peopleToContact.length) {
            const i = Math.round(Math.random() * (peopleToContact.length - 1));
            shuffledPeopleToContact.push(peopleToContact.splice(i, 1)[0]);
          }
          setWeeklyContactList(user.id, shuffledPeopleToContact, weeklyContactListNext);
        },
        (bucketsNext) => {
          if (user.state.dailyBucketsUpdated >= midnight) {
            bucketsNext();
            return;
          }
          console.log('Creating the daily buckets');
          const startOfToday = midnight + user.settings.startOfDay * HOUR_IN_MS;
          const endOfToday = midnight + user.settings.endOfDay * HOUR_IN_MS;
          const buckets: IDailyBucket[] = [];
          for (let timestamp = startOfToday; timestamp < endOfToday; timestamp += BUCKET_DURATION) {
            buckets.push({
              timestamp,
              available: true // TODO: hook in calendar information
            });
          }
          setDailyBuckets(user.id, buckets, bucketsNext);
        },
        (processNext) => {
          console.log('Processing next bucket');
          processNext();
        }
      ], next);
    }), (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send({ status: 'ok' });
      }
    });
  });

  app.post('/api/snoozeNotification', auth.createMiddleware(false), (req, res) => {
    // TODO
  });

  app.post('/api/rescheduleNotification', auth.createMiddleware(false), (req, res) => {
    // TODO
  });

  app.post('/api/respondToNotification', auth.createMiddleware(false), (req, res) => {
    // TODO
  });

  app.post('/api/createNotification', auth.createMiddleware(false), (req, res) => {
    const pushSubscription = getPushSubscription((req as IRequest).userId);
    sendNotification(pushSubscription, JSON.stringify({
      name: 'Faruk Ates',
      url: 'https://www.messenger.com/t/farukates'
    })).then(() => {
      console.log('sent!');
      res.send({ status: 'ok' });
    }).catch((sendErr) => {
      console.log(sendErr);
      res.sendStatus(500);
    });
  });

  app.listen(port, () => {
    console.log(`API server listening on port ${port}.`);
    cb(undefined);
  });
}
