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

import { getEnvironmentVariable } from './common/util';
import { MongoClient } from 'mongodb';
// import { COLLECTIONS } from './common/db_info';
// import { CB } from './common/cb';

export function run(context: any, req: any): void {
  context.log('Connecting to MongoDB');
  MongoClient.connect(getEnvironmentVariable('COSMOS_CONNECTION_STRING'), (connectErr, client) => {
    if (connectErr) {
      context.log(`Error connecting to MongoDB: ${connectErr}`);
      context.res = {
        status: 500
      };
      context.done();
      return;
    }
    context.log('Connected to MongoDB');
    // const db = client.db(getEnvironmentVariable('COSMOS_DB_NAME'));
    context.done();
  });
}
