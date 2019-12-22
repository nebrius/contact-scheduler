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
import { app, BrowserWindow, Tray, Menu, MenuItem, ipcMain, Event } from 'electron';
import { createInfrastructureServer, addStaticAssetRoute, addRoute, sendMessageToWindows } from '@nebrius/electron-infrastructure-main';
import {
  WindowTypes,
  MessageTypes,
  ISaveContactMessage,
  IDeleteContactMessage,
  ISaveCalendarMessage,
  IDeleteCalendarMessage,
  IUpdateCalendarsMessage,
  IUpdateContactsMessage,
  IUpdateQueueMessage
} from './common/messages';
import {
  IAppArguments,
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
import {
  init as initScheduler,
  closeNotification,
  respond,
  pushToBack,
  enableDoNotDisturb,
  disableDoNotDisturb
} from './scheduler';
import { log, error } from './util';
import { INTERNAL_SERVER_PORT } from './common/config';

const ICON_PATH = join(__dirname, 'icon.png');

// Keep a global reference of the window and tray objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function quitApp() {
  if (tray) {
    tray.destroy();
  }
  process.exit(0);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: ICON_PATH
  });
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  const args: IAppArguments = {
    calendars: dataSource.getCalendars(),
    contacts: dataSource.getContacts(),
    contactQueue: dataSource.getQueue().contactQueue
  };
  const serializedArgs = Buffer.from(JSON.stringify(args)).toString('base64');
  await mainWindow.loadURL(`http://localhost:${INTERNAL_SERVER_PORT}/index.html?initArgs=${serializedArgs}`);
}

function createTray() {
  tray = new Tray(ICON_PATH);
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Quit',
    type: 'normal',
    click() {
      quitApp();
    }
  }, {
    label: 'Do Not Disturb',
    type: 'checkbox',
    click(menuItem: MenuItem) {
      if (menuItem.checked) {
        enableDoNotDisturb();
      } else {
        disableDoNotDisturb();
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

app.on('ready', async () => {
  await createInfrastructureServer(INTERNAL_SERVER_PORT);
  addStaticAssetRoute('/', join(__dirname, '..', '..', 'renderer', 'dist'));
  addRoute('/', (req, res) => {
    res.send();
  });
  await initDB();
  await initScheduler();
  createTray();
  await createWindow();
  log('running');
});

app.on('window-all-closed', () => {
  // Normally we'd quit the app here, but since we have a system tray icon,
  // closing all windows behavior is different
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function updateQueueInClient() {
  if (mainWindow) {
    const message: IUpdateQueueMessage = {
      messageType: MessageTypes.UpdateQueue,
      queue: dataSource.getQueue().contactQueue
    };
    sendMessageToWindows(WindowTypes.Main, message);
  }
}

function finalizeContactOperation() {
  if (mainWindow) {
    const message: IUpdateContactsMessage = {
      messageType: MessageTypes.UpdateContacts,
      contacts: dataSource.getContacts()
    };
    sendMessageToWindows(WindowTypes.Main, message);
  }
}

ipcMain.on(MessageTypes.RequestSaveContact, async (event: Event, arg: string) => {
  const parsedArgs: ISaveContactMessage = JSON.parse(arg);
  if (typeof parsedArgs.contact.id !== 'number' || isNaN(parsedArgs.contact.id)) {
    await createContact(parsedArgs.contact);
    finalizeContactOperation();
  } else {
    await updateContact(parsedArgs.contact);
    finalizeContactOperation();
  }
});

ipcMain.on(MessageTypes.RequestDeleteContact, async (event: Event, arg: string) => {
  const parsedArgs: IDeleteContactMessage = JSON.parse(arg);
  await deleteContact(parsedArgs.contact);
  finalizeContactOperation();
});

function finalizeCalendarOperation() {
  if (mainWindow) {
    const message: IUpdateCalendarsMessage = {
      messageType: MessageTypes.UpdateCalendars,
      calendars: dataSource.getCalendars()
    };
    sendMessageToWindows(WindowTypes.Main, message);
  }
}

ipcMain.on(MessageTypes.RequestSaveCalendar, async (event: Event, arg: string) => {
  const parsedArgs: ISaveCalendarMessage = JSON.parse(arg);
  if (typeof parsedArgs.calendar.id !== 'number' || isNaN(parsedArgs.calendar.id)) {
    await createCalendar(parsedArgs.calendar);
    finalizeCalendarOperation();
  } else {
    await updateCalendar(parsedArgs.calendar);
    finalizeCalendarOperation();
  }
});

ipcMain.on(MessageTypes.RequestDeleteCalendar, async (event: Event, arg: string) => {
  const parsedArgs: IDeleteCalendarMessage = JSON.parse(arg);
  await deleteCalendar(parsedArgs.calendar);
  finalizeCalendarOperation();
});

ipcMain.on(MessageTypes.CloseNotification, (event: Event, arg: string) => {
  closeNotification();
});

ipcMain.on(MessageTypes.Respond, async (event: Event, arg: string) => {
  try {
    await respond();
    log('Respond to contact');
    updateQueueInClient();
  } catch (err) {
    error(`Could not respond to contact: ${err}`);
  }
  closeNotification();
});

ipcMain.on(MessageTypes.PushToBack, async (event: Event, arg: string) => {
  try {
    await pushToBack();
    log('Pushed current contact to the back of the queue');
    updateQueueInClient();
  } catch (err) {
      error(`Could not push contact to the back of the queue: ${err}`);
  }
  closeNotification();
});
