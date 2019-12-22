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
const path_1 = require("path");
const electron_1 = require("electron");
const handler = require("serve-handler");
const http_1 = require("http");
const messages_1 = require("./common/messages");
const db_1 = require("./db");
const scheduler_1 = require("./scheduler");
const util_1 = require("./util");
const ICON_PATH = path_1.join(__dirname, 'icon.png');
// Keep a global reference of the window and tray objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let tray = null;
function quitApp() {
    if (tray) {
        tray.destroy();
    }
    process.exit(0);
}
function createWindow() {
    const args = {
        calendars: db_1.dataSource.getCalendars(),
        contacts: db_1.dataSource.getContacts(),
        contactQueue: db_1.dataSource.getQueue().contactQueue
    };
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        icon: ICON_PATH,
        webPreferences: {
            additionalArguments: [JSON.stringify(args)]
        }
    });
    mainWindow.loadURL(`http://localhost:${util_1.INTERNAL_SERVER_PORT}/app.html`);
    mainWindow.on('closed', () => { mainWindow = null; });
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });
}
function createTray() {
    tray = new electron_1.Tray(ICON_PATH);
    const contextMenu = electron_1.Menu.buildFromTemplate([{
            label: 'Quit',
            type: 'normal',
            click() {
                quitApp();
            }
        }, {
            label: 'Do Not Disturb',
            type: 'checkbox',
            click(menuItem) {
                if (menuItem.checked) {
                    scheduler_1.enableDoNotDisturb();
                }
                else {
                    scheduler_1.disableDoNotDisturb();
                }
            }
        }]);
    tray.setToolTip('Contact Scheduler');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        if (!mainWindow) {
            createWindow();
        }
    });
}
electron_1.app.on('ready', () => {
    http_1.createServer((request, response) => handler(request, response, {
        public: path_1.join(__dirname, '..', '..', 'renderer', 'dist')
    })).listen(util_1.INTERNAL_SERVER_PORT, async () => {
        await db_1.init();
        await scheduler_1.init();
        createWindow();
        createTray();
        util_1.log('running');
    });
});
electron_1.app.on('window-all-closed', () => {
    // Normally we'd quit the app here, but since we have a system tray icon,
    // closing all windows behavior is different
});
electron_1.app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
function updateQueueInClient() {
    if (mainWindow) {
        const args = {
            queue: db_1.dataSource.getQueue().contactQueue
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateQueue, JSON.stringify(args));
    }
}
function finalizeContactOperation() {
    if (mainWindow) {
        const args = {
            contacts: db_1.dataSource.getContacts()
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateContacts, JSON.stringify(args));
    }
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveContact, async (event, arg) => {
    const parsedArgs = JSON.parse(arg);
    if (typeof parsedArgs.contact.id !== 'number' || isNaN(parsedArgs.contact.id)) {
        await db_1.createContact(parsedArgs.contact);
        finalizeContactOperation();
    }
    else {
        await db_1.updateContact(parsedArgs.contact);
        finalizeContactOperation();
    }
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteContact, async (event, arg) => {
    const parsedArgs = JSON.parse(arg);
    await db_1.deleteContact(parsedArgs.contact);
    finalizeContactOperation();
});
function finalizeCalendarOperation() {
    if (mainWindow) {
        const args = {
            calendars: db_1.dataSource.getCalendars()
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateCalendars, JSON.stringify(args));
    }
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveCalendar, async (event, arg) => {
    const parsedArgs = JSON.parse(arg);
    if (typeof parsedArgs.calendar.id !== 'number' || isNaN(parsedArgs.calendar.id)) {
        await db_1.createCalendar(parsedArgs.calendar);
        finalizeCalendarOperation();
    }
    else {
        await db_1.updateCalendar(parsedArgs.calendar);
        finalizeCalendarOperation();
    }
});
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteCalendar, async (event, arg) => {
    const parsedArgs = JSON.parse(arg);
    await db_1.deleteCalendar(parsedArgs.calendar);
    finalizeCalendarOperation();
});
electron_1.ipcMain.on(messages_1.MessageTypes.CloseNotification, (event, arg) => {
    scheduler_1.closeNotification();
});
electron_1.ipcMain.on(messages_1.MessageTypes.Respond, async (event, arg) => {
    try {
        await scheduler_1.respond();
        util_1.log('Respond to contact');
        updateQueueInClient();
    }
    catch (err) {
        util_1.error(`Could not respond to contact: ${err}`);
    }
    scheduler_1.closeNotification();
});
electron_1.ipcMain.on(messages_1.MessageTypes.PushToBack, async (event, arg) => {
    try {
        await scheduler_1.pushToBack();
        util_1.log('Pushed current contact to the back of the queue');
        updateQueueInClient();
    }
    catch (err) {
        util_1.error(`Could not push contact to the back of the queue: ${err}`);
    }
    scheduler_1.closeNotification();
});
//# sourceMappingURL=index.js.map