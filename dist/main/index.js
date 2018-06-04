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
var async_1 = require("async");
var electron_1 = require("electron");
var messages_1 = require("./common/messages");
var db_1 = require("./db");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var dialogWindows = [];
function createWindow(args) {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            additionalArguments: [JSON.stringify(args)]
        }
    });
    mainWindow.loadFile(path_1.join(__dirname, '..', 'renderer', 'app.html'));
    mainWindow.on('closed', function () { mainWindow = null; });
}
electron_1.app.on('ready', function () {
    async_1.waterfall([
        function (next) { return db_1.init(next); },
        function (next) { return db_1.getCalendars(next); }
    ], function (err, calendars) {
        if (err) {
            console.error(err);
            process.exit(-1);
        }
        createWindow({
            calendars: calendars
        });
        console.log('running');
    });
});
electron_1.app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (mainWindow === null) {
    //   createWindow();
    // }
    // TODO: re-enable the above
});
function openDialogWindow(contentPath, title, args) {
    var dialogWindow = new electron_1.BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            additionalArguments: [JSON.stringify(args)]
        }
    });
    dialogWindow.setMenu(null);
    dialogWindow.loadFile(contentPath);
    dialogWindow.setTitle(title);
    dialogWindow.on('closed', function () {
        dialogWindows.splice(dialogWindows.indexOf(dialogWindow));
    });
    dialogWindows.push(dialogWindow);
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestAddCalendar, function (event, arg) {
    var args = {
        isAdd: true
    };
    openDialogWindow(path_1.join(__dirname, '..', 'renderer', 'calendar.html'), 'Add Calendar', args);
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveCalendar, function (event, arg) {
    var calendar = JSON.parse(arg);
    function finalize() {
        event.sender.getOwnerBrowserWindow().close();
    }
    if (typeof calendar.id !== 'number' || isNaN(calendar.id)) {
        db_1.createCalendar(calendar, function (err) {
            if (err) {
                console.error(err);
            }
            finalize();
        });
    }
    else {
        // TODO once editing calendars is implemented
        finalize();
    }
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteCalendar, function (event, arg) {
    var calendar = JSON.parse(arg);
    console.log(calendar);
    // TODO: delete calendar from db
    event.sender.getOwnerBrowserWindow().close();
});
//# sourceMappingURL=index.js.map