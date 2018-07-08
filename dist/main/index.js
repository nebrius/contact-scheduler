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
var scheduler_1 = require("./scheduler");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
function createWindow(args) {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            additionalArguments: [JSON.stringify(args)]
        }
    });
    mainWindow.loadFile(path_1.join(__dirname, '..', 'renderer', 'app.html'));
    mainWindow.on('closed', function () { mainWindow = null; });
    mainWindow.once('ready-to-show', function () {
        if (mainWindow) {
            mainWindow.show();
        }
    });
}
electron_1.app.on('ready', function () {
    async_1.series([
        function (next) { return db_1.init(next); },
        function (next) { return scheduler_1.init(next); }
    ], function (err) {
        if (err) {
            console.error(err);
            process.exit(-1);
            return;
        }
        createWindow({
            calendars: db_1.dataSource.getCalendars(),
            contacts: db_1.dataSource.getContacts(),
            contactQueue: db_1.dataSource.getQueue().contactQueue
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
    if (mainWindow === null) {
        createWindow({
            calendars: db_1.dataSource.getCalendars(),
            contacts: db_1.dataSource.getContacts(),
            contactQueue: db_1.dataSource.getQueue().contactQueue
        });
    }
});
function updateQueueInClient() {
    if (mainWindow) {
        var args = {
            queue: db_1.dataSource.getQueue().contactQueue
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateQueue, JSON.stringify(args));
    }
}
function finalizeContactOperation(operationErr) {
    if (operationErr) {
        console.error(operationErr);
        return;
    }
    if (mainWindow) {
        var args = {
            contacts: db_1.dataSource.getContacts()
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateContacts, JSON.stringify(args));
    }
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveContact, function (event, arg) {
    var parsedArgs = JSON.parse(arg);
    if (typeof parsedArgs.contact.id !== 'number' || isNaN(parsedArgs.contact.id)) {
        db_1.createContact(parsedArgs.contact, finalizeContactOperation);
    }
    else {
        db_1.updateContact(parsedArgs.contact, finalizeContactOperation);
    }
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteContact, function (event, arg) {
    var parsedArgs = JSON.parse(arg);
    db_1.deleteContact(parsedArgs.contact, finalizeContactOperation);
});
function finalizeCalendarOperation(operationErr) {
    if (operationErr) {
        console.error(operationErr);
        return;
    }
    if (mainWindow) {
        var args = {
            calendars: db_1.dataSource.getCalendars()
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateCalendars, JSON.stringify(args));
    }
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveCalendar, function (event, arg) {
    var parsedArgs = JSON.parse(arg);
    if (typeof parsedArgs.calendar.id !== 'number' || isNaN(parsedArgs.calendar.id)) {
        db_1.createCalendar(parsedArgs.calendar, finalizeCalendarOperation);
    }
    else {
        db_1.updateCalendar(parsedArgs.calendar, finalizeCalendarOperation);
    }
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteCalendar, function (event, arg) {
    var parsedArgs = JSON.parse(arg);
    db_1.deleteCalendar(parsedArgs.calendar, finalizeCalendarOperation);
});
electron_1.ipcMain.on(messages_1.MessageTypes.CloseNotification, function (event, arg) {
    scheduler_1.closeNotification();
});
electron_1.ipcMain.on(messages_1.MessageTypes.Respond, function (event, arg) {
    scheduler_1.respond(function (err) {
        if (err) {
            console.error("Could not respond to contact: " + err);
        }
        else {
            console.log('Respond to contact');
            updateQueueInClient();
        }
        scheduler_1.closeNotification();
    });
});
electron_1.ipcMain.on(messages_1.MessageTypes.PushToBack, function (event, arg) {
    scheduler_1.pushToBack(function (err) {
        if (err) {
            console.error("Could not push contact to the back of the queue: " + err);
        }
        else {
            console.log('Pushed current contact to the back of the queue');
            updateQueueInClient();
        }
        scheduler_1.closeNotification();
    });
});
//# sourceMappingURL=index.js.map