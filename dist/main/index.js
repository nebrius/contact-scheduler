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
var electron_1 = require("electron");
var messages_1 = require("./common/messages");
var db_1 = require("./db");
db_1.init(function (err) {
    if (err) {
        console.error(err);
        process.exit(-1);
    }
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var dialogWindows = [];
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path_1.join(__dirname, '..', 'renderer', 'app.html'));
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', createWindow);
// Quit when all windows are closed.
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
        createWindow();
    }
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
    console.log(calendar);
    // TODO: save calendar to db
    event.sender.getOwnerBrowserWindow().close();
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteCalendar, function (event, arg) {
    var calendar = JSON.parse(arg);
    console.log(calendar);
    // TODO: delete calendar from db
    event.sender.getOwnerBrowserWindow().close();
});
//# sourceMappingURL=index.js.map