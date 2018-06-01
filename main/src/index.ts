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
import { app, BrowserWindow, ipcMain, Event } from 'electron';
import { MessageTypes } from './common/messages';
import { ICalendarDialogArguments } from './common/arguments';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;
const dialogWindows: BrowserWindow[] = [];

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  mainWindow.loadFile(join(__dirname, '..', 'renderer', 'app.html'));

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
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
    createWindow();
  }
});

function openDialogWindow(contentPath: string, title: string, args: { [ key: string ]: any }): void {
  const dialogWindow = new BrowserWindow({
    width: 640,
    height: 480,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      additionalArguments: [ JSON.stringify(args) ]
    }
  } as any);

  dialogWindow.loadFile(contentPath);
  dialogWindow.setTitle(title);

  dialogWindow.on('closed', () => {
    dialogWindows.splice(dialogWindows.indexOf(dialogWindow));
  });

  dialogWindows.push(dialogWindow);
}

ipcMain.on(MessageTypes.RequestAddCalendar, (event: Event, arg: string) => {
  const args: ICalendarDialogArguments = {
    isNew: true
  };
  openDialogWindow(join(__dirname, '..', 'renderer', 'calendar.html'), 'Add Calendar', args);
});
