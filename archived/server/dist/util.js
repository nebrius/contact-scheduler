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
var moment = require("moment-timezone");
function getEnvironmentVariable(variable) {
    var value = process.env[variable];
    if (typeof value !== 'string') {
        throw new Error("Environment variable " + variable + " is not defined");
    }
    return value;
}
exports.getEnvironmentVariable = getEnvironmentVariable;
function toStringWithPadding(value, digits) {
    var convertedString = value.toString();
    while (convertedString.length < digits) {
        convertedString = '0' + convertedString;
    }
    return convertedString;
}
exports.toStringWithPadding = toStringWithPadding;
function getStartOfToday(timezone) {
    var now = moment().tz(timezone);
    var startOfDay = moment.tz(toStringWithPadding(now.year(), 4) + "-" + toStringWithPadding(now.month() + 1, 2) + "-" + toStringWithPadding(now.date(), 2), timezone);
    return startOfDay.unix() * 1000;
}
exports.getStartOfToday = getStartOfToday;
function getStartOfWeek(timezone) {
    var start = new Date(getStartOfToday(timezone));
    return start.getTime() - start.getDay() * 24 * 60 * 60 * 1000;
}
exports.getStartOfWeek = getStartOfWeek;
//# sourceMappingURL=util.js.map