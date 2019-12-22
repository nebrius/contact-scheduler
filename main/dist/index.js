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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var electron_1 = require("electron");
var messages_1 = require("./common/messages");
var db_1 = require("./db");
var scheduler_1 = require("./scheduler");
var util_1 = require("./util");
var ICON_PATH = path_1.join(__dirname, 'icon.png');
// Keep a global reference of the window and tray objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var tray = null;
function quitApp() {
    if (tray) {
        tray.destroy();
    }
    process.exit(0);
}
function createWindow() {
    var args = {
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
    mainWindow.loadFile(path_1.join(__dirname, '..', 'renderer', 'dist', 'app.html'));
    mainWindow.on('closed', function () { mainWindow = null; });
    mainWindow.once('ready-to-show', function () {
        if (mainWindow) {
            mainWindow.show();
        }
    });
}
function createTray() {
    tray = new electron_1.Tray(ICON_PATH);
    var contextMenu = electron_1.Menu.buildFromTemplate([{
            label: 'Quit',
            type: 'normal',
            click: function () {
                quitApp();
            }
        }, {
            label: 'Do Not Disturb',
            type: 'checkbox',
            click: function (menuItem) {
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
    tray.on('click', function () {
        if (!mainWindow) {
            createWindow();
        }
    });
}
electron_1.app.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.init()];
            case 1:
                _a.sent();
                return [4 /*yield*/, scheduler_1.init()];
            case 2:
                _a.sent();
                createWindow();
                createTray();
                util_1.log('running');
                return [2 /*return*/];
        }
    });
}); });
electron_1.app.on('window-all-closed', function () {
    // Normally we'd quit the app here, but since we have a system tray icon,
    // closing all windows behavior is different
});
electron_1.app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
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
function finalizeContactOperation() {
    if (mainWindow) {
        var args = {
            contacts: db_1.dataSource.getContacts()
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateContacts, JSON.stringify(args));
    }
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveContact, function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedArgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                parsedArgs = JSON.parse(arg);
                if (!(typeof parsedArgs.contact.id !== 'number' || isNaN(parsedArgs.contact.id))) return [3 /*break*/, 2];
                return [4 /*yield*/, db_1.createContact(parsedArgs.contact)];
            case 1:
                _a.sent();
                finalizeContactOperation();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, db_1.updateContact(parsedArgs.contact)];
            case 3:
                _a.sent();
                finalizeContactOperation();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteContact, function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedArgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                parsedArgs = JSON.parse(arg);
                return [4 /*yield*/, db_1.deleteContact(parsedArgs.contact)];
            case 1:
                _a.sent();
                finalizeContactOperation();
                return [2 /*return*/];
        }
    });
}); });
function finalizeCalendarOperation() {
    if (mainWindow) {
        var args = {
            calendars: db_1.dataSource.getCalendars()
        };
        mainWindow.webContents.send(messages_1.MessageTypes.UpdateCalendars, JSON.stringify(args));
    }
}
electron_1.ipcMain.on(messages_1.MessageTypes.RequestSaveCalendar, function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedArgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                parsedArgs = JSON.parse(arg);
                if (!(typeof parsedArgs.calendar.id !== 'number' || isNaN(parsedArgs.calendar.id))) return [3 /*break*/, 2];
                return [4 /*yield*/, db_1.createCalendar(parsedArgs.calendar)];
            case 1:
                _a.sent();
                finalizeCalendarOperation();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, db_1.updateCalendar(parsedArgs.calendar)];
            case 3:
                _a.sent();
                finalizeCalendarOperation();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on(messages_1.MessageTypes.RequestDeleteCalendar, function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedArgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                parsedArgs = JSON.parse(arg);
                return [4 /*yield*/, db_1.deleteCalendar(parsedArgs.calendar)];
            case 1:
                _a.sent();
                finalizeCalendarOperation();
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on(messages_1.MessageTypes.CloseNotification, function (event, arg) {
    scheduler_1.closeNotification();
});
electron_1.ipcMain.on(messages_1.MessageTypes.Respond, function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, scheduler_1.respond()];
            case 1:
                _a.sent();
                util_1.log('Respond to contact');
                updateQueueInClient();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                util_1.error("Could not respond to contact: " + err_1);
                return [3 /*break*/, 3];
            case 3:
                scheduler_1.closeNotification();
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on(messages_1.MessageTypes.PushToBack, function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, scheduler_1.pushToBack()];
            case 1:
                _a.sent();
                util_1.log('Pushed current contact to the back of the queue');
                updateQueueInClient();
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                util_1.error("Could not push contact to the back of the queue: " + err_2);
                return [3 /*break*/, 3];
            case 3:
                scheduler_1.closeNotification();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=index.js.map