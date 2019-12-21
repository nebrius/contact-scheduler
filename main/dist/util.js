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
var path_1 = require("path");
var fs_1 = require("fs");
var bugUrl = JSON.parse(fs_1.readFileSync(path_1.join(__dirname, '..', 'package.json')).toString()).bugs.url;
function handleInternalError(message) {
    if (process.env.NODE_ENV === 'development') {
        throw new Error("Internal Error: " + message);
    }
    else {
        var msg = "Internal Error: " + message + ". Please report this bug at " + bugUrl;
        error(msg);
        return new Error(msg);
    }
}
exports.handleInternalError = handleInternalError;
function log(message) {
    console.log((new Date()).toLocaleString() + ": " + message);
}
exports.log = log;
function error(message) {
    console.error((new Date()).toLocaleString() + ": " + message);
}
exports.error = error;
//# sourceMappingURL=util.js.map