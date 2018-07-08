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
import { series } from 'async';
import { app, BrowserWindow, ipcMain, Event } from 'electron';
import {
  MessageTypes,
  ISaveContactMessage,
  IDeleteContactMessage,
  ISaveCalendarMessage,
  IDeleteCalendarMessage
} from './common/messages';
import { CB } from './common/types';
import {
  IAppArguments,
  IUpdateCalendarsArguments,
  IUpdateContactsArguments,
  IUpdateQueueArguments
} from './common/arguments';
import {
  init as initDB,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  createContact,
  updateContact,
  deleteContact,
  dataSource
} from './db';
import { init as initScheduler, closeNotification, respond, pushToBack } from './scheduler';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;

function createWindow(args: IAppArguments) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      additionalArguments: [ JSON.stringify(args) ]
    }
  } as any);
  mainWindow.loadFile(join(__dirname, '..', 'renderer', 'app.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

app.on('ready', () => {
  series([
    (next: CB) => initDB(next),
    (next: CB) => initScheduler(next)
  ], (err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
      return;
    }
    createWindow({
      calendars: dataSource.getCalendars(),
      contacts: dataSource.getContacts(),
      contactQueue: dataSource.getQueue().contactQueue
    });
    console.log('running');
  });
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow({
      calendars: dataSource.getCalendars(),
      contacts: dataSource.getContacts(),
      contactQueue: dataSource.getQueue().contactQueue
    });
  }
});

function updateQueueInClient() {
  if (mainWindow) {
    const args: IUpdateQueueArguments = {
      queue: dataSource.getQueue().contactQueue
    };
    mainWindow.webContents.send(MessageTypes.UpdateQueue, JSON.stringify(args));
  }
}

function finalizeContactOperation(operationErr?: Error) {
  if (operationErr) {
    console.error(operationErr);
    return;
  }
  if (mainWindow) {
    const args: IUpdateContactsArguments = {
      contacts: dataSource.getContacts()
    };
    mainWindow.webContents.send(MessageTypes.UpdateContacts, JSON.stringify(args));
  }
}

ipcMain.on(MessageTypes.RequestSaveContact, (event: Event, arg: string) => {
  const parsedArgs: ISaveContactMessage = JSON.parse(arg);
  if (typeof parsedArgs.contact.id !== 'number' || isNaN(parsedArgs.contact.id)) {
    createContact(parsedArgs.contact, finalizeContactOperation);
  } else {
    updateContact(parsedArgs.contact, finalizeContactOperation);
  }
});

ipcMain.on(MessageTypes.RequestDeleteContact, (event: Event, arg: string) => {
  const parsedArgs: IDeleteContactMessage = JSON.parse(arg);
  deleteContact(parsedArgs.contact, finalizeContactOperation);
});

function finalizeCalendarOperation(operationErr?: Error) {
  if (operationErr) {
    console.error(operationErr);
    return;
  }
  if (mainWindow) {
    const args: IUpdateCalendarsArguments = {
      calendars: dataSource.getCalendars()
    };
    mainWindow.webContents.send(MessageTypes.UpdateCalendars, JSON.stringify(args));
  }
}

ipcMain.on(MessageTypes.RequestSaveCalendar, (event: Event, arg: string) => {
  const parsedArgs: ISaveCalendarMessage = JSON.parse(arg);
  if (typeof parsedArgs.calendar.id !== 'number' || isNaN(parsedArgs.calendar.id)) {
    createCalendar(parsedArgs.calendar, finalizeCalendarOperation);
  } else {
    updateCalendar(parsedArgs.calendar, finalizeCalendarOperation);
  }
});

ipcMain.on(MessageTypes.RequestDeleteCalendar, (event: Event, arg: string) => {
  const parsedArgs: IDeleteCalendarMessage = JSON.parse(arg);
  deleteCalendar(parsedArgs.calendar, finalizeCalendarOperation);
});

ipcMain.on(MessageTypes.CloseNotification, (event: Event, arg: string) => {
  closeNotification();
});

ipcMain.on(MessageTypes.Respond, (event: Event, arg: string) => {
  respond((err) => {
    if (err) {
      console.error(`Could not respond to contact: ${err}`);
    } else {
      console.log('Respond to contact');
      updateQueueInClient();
    }
    closeNotification();
  });
});

ipcMain.on(MessageTypes.PushToBack, (event: Event, arg: string) => {
  pushToBack((err) => {
    if (err) {
      console.error(`Could not push contact to the back of the queue: ${err}`);
    } else {
      console.log('Pushed current contact to the back of the queue');
      updateQueueInClient();
    }
    closeNotification();
  });
});
