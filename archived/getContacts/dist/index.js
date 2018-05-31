"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./common/util");
var mongodb_1 = require("mongodb");
var db_info_1 = require("./common/db_info");
// import { IUser } from './common/IUser';
var db;
function run(context, req) {
    context.log('Connecting to MongoDB');
    mongodb_1.MongoClient.connect(util_1.getEnvironmentVariable('COSMOS_CONNECTION_STRING'), function (connectErr, client) {
        if (connectErr) {
            context.log("Error connecting to MongoDB: " + connectErr);
            context.res = {
                status: 500
            };
            context.done();
            return;
        }
        context.log('Connected to MongoDB');
        db = client.db(util_1.getEnvironmentVariable('COSMOS_DB_NAME'));
        db.collection(db_info_1.COLLECTIONS.USERS).find({});
        context.done();
    });
}
exports.run = run;
//# sourceMappingURL=index.js.map