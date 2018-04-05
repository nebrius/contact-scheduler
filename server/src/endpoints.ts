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
import { CB } from './common/types';
import { getEnvironmentVariable } from './common/util';
import { isUserRegistered, getContacts, setContacts } from './db';

interface IRequest extends express.Request {
  userId: string;
}

const DEFAULT_PORT = 3000;

export function init(cb: CB): void {

  const port = process.env.PORT || DEFAULT_PORT;

  function getRedirectUri(): string {
    return process.env.NODE_ENV === 'production'
      ? `${getEnvironmentVariable('SERVER_HOST')}/login-success/`
      : `http://localhost:${port}/login-success/`;
  }

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
    res.render('login', {
      facebookAppId: getEnvironmentVariable('FACEBOOK_APP_ID'),
      redirectUri: getRedirectUri()
    });
  });

  auth.createLoginSuccessEndpoint(app);

  app.get('/', auth.createMiddleware(true), (req, res) => {
    res.render('index');
  });

  app.get('/api/contacts', auth.createMiddleware(false), (req, res) => {
    res.send(getContacts((req as IRequest).userId));
  });

  app.post('/api/contacts', auth.createMiddleware(false), (req, res) => {
    const { userId, body: { contacts } } = req as IRequest;
    console.log(userId, contacts);
    setContacts(userId, contacts, (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send('ok');
      }
    });
  });

  app.post('/api/update', (req, res) => {
    // TODO
  });

  app.listen(port, () => {
    console.log(`API server listening on port ${port}.`);
    cb(undefined);
  });
}
