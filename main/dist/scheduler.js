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
const db_1 = require("./db");
const moment = require("moment-timezone");
const electron_1 = require("electron");
const util_1 = require("./util");
// TODO: These settings should be made configurable by the user eventually
const TIME_BUCKET_INTERVAL = 1000 * 60 * 15;
const NOTIFICATION_DURATION = 15000;
const MAX_WEEKLY_CONTACTS = 10;
const START_OF_AVAILABILITY = 10;
const END_OF_AVAILABILITY = 17;
let timeBuckets = [];
let notificationWindow;
let doNotDisturbEnabled = false;
const NOTIFICATION_WIDTH = 310;
const NOTIFICATION_HEIGHT = 150;
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const MIN_MONTHLY_GAP = DAY_IN_MS * 25;
const MONTHLY_GAP_SCALING_FACTOR = 0.1 / DAY_IN_MS;
const MIN_QUARTERLY_GAP = DAY_IN_MS * 80;
const QUARTERLY_GAP_SCALING_FACTOR = 0.05 / DAY_IN_MS;
async function respond() {
    const contactQueue = [...db_1.dataSource.getQueue().contactQueue];
    const currentContact = contactQueue.shift();
    if (currentContact) {
        util_1.log(`Responded to ${currentContact.name}`);
        await db_1.setLastContactedDate(currentContact, Date.now());
        await db_1.setWeeklyQueue(contactQueue);
    }
    else {
        throw util_1.createInternalError('Respond called with an empty queue');
    }
    let availableBuckets = 0;
    for (const bucket of timeBuckets) {
        if (bucket.available) {
            availableBuckets++;
        }
    }
    let numBucketsToBlock = Math.floor(availableBuckets / (2 * db_1.dataSource.getQueue().contactQueue.length));
    let i = 0;
    while (numBucketsToBlock > 0 && i < timeBuckets.length) {
        if (timeBuckets[i].available) {
            timeBuckets[i].available = false;
            numBucketsToBlock--;
        }
        i++;
    }
}
exports.respond = respond;
async function pushToBack() {
    const contactQueue = [...db_1.dataSource.getQueue().contactQueue];
    const currentContact = contactQueue.shift();
    if (currentContact) {
        contactQueue.push(currentContact);
        await db_1.setWeeklyQueue(contactQueue);
    }
}
exports.pushToBack = pushToBack;
function closeNotification() {
    if (notificationWindow) {
        notificationWindow.close();
    }
}
exports.closeNotification = closeNotification;
function enableDoNotDisturb() {
    util_1.log('Enabling Do Not Disturb mode');
    doNotDisturbEnabled = true;
}
exports.enableDoNotDisturb = enableDoNotDisturb;
function disableDoNotDisturb() {
    util_1.log('Disabling Do Not Disturb mode');
    doNotDisturbEnabled = false;
}
exports.disableDoNotDisturb = disableDoNotDisturb;
async function init() {
    setTimeout(tick, 5000);
    await refreshQueue();
    await refreshTimeBuckets();
}
exports.init = init;
async function tick() {
    const now = Date.now();
    // TODO: add support for system level notification state on all three platforms (but Linux first)
    if (doNotDisturbEnabled) {
        util_1.log('Skipping notification tick because Do Not Disturb is enabled in the app or OS');
    }
    else {
        // Get rid of expired buckets, if they exist
        while (timeBuckets.length && timeBuckets[0].start + TIME_BUCKET_INTERVAL < now) {
            timeBuckets.shift();
        }
        if (!timeBuckets.length) {
            util_1.log('Determining the week\'s schedule...');
            await refreshQueue();
            await refreshTimeBuckets();
            util_1.log('Done determing the week\'s schedule');
        }
        else {
            // Extra sanity-checking just in case we hit a gap in the time buckets. This *should* never happen
            if (timeBuckets.length && timeBuckets[0].start < now) {
                const currentBucket = timeBuckets.shift();
                if (currentBucket && currentBucket.available) {
                    showNotification();
                }
                else {
                    util_1.log('Nothing to do this interval because the user is not available');
                }
            }
            else {
                throw util_1.createInternalError('Gap in time buckets detected');
            }
        }
    }
    setTimeout(tick, TIME_BUCKET_INTERVAL);
}
async function refreshTimeBuckets() {
    const endOfWeek = moment().endOf('week');
    const currentBucket = moment().startOf('hour');
    timeBuckets = [];
    while (currentBucket.isBefore(endOfWeek)) {
        const available = currentBucket.hour() >= START_OF_AVAILABILITY &&
            currentBucket.hour() < END_OF_AVAILABILITY &&
            currentBucket.day() > 0 &&
            currentBucket.day() < 6;
        timeBuckets.push({
            start: currentBucket.toDate().getTime(),
            available
        });
        currentBucket.add(TIME_BUCKET_INTERVAL, 'milliseconds');
    }
    return Promise.resolve();
}
async function refreshQueue() {
    const queue = db_1.dataSource.getQueue();
    const lastUpdated = moment(queue.lastUpdated);
    if (lastUpdated.isAfter(moment().startOf('week'))) {
        return Promise.resolve();
    }
    const contacts = db_1.dataSource.getContacts();
    const weights = [];
    for (const contact of contacts) {
        const gap = Date.now() - contact.lastContacted;
        switch (contact.frequency) {
            case 'weekly':
                weights.push({
                    contact,
                    weight: 1
                });
                break;
            case 'monthly':
                if (gap > MIN_MONTHLY_GAP) {
                    weights.push({
                        contact,
                        weight: Math.min(1, MONTHLY_GAP_SCALING_FACTOR * (gap - MIN_MONTHLY_GAP))
                    });
                }
                break;
            case 'quarterly':
                if (gap > MIN_QUARTERLY_GAP) {
                    weights.push({
                        contact,
                        weight: Math.min(1, QUARTERLY_GAP_SCALING_FACTOR * (gap - MIN_QUARTERLY_GAP))
                    });
                }
                break;
        }
    }
    // Shuffle the list using the Fisher-Yates algorithm:
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    const newContactQueue = weights
        .sort((a, b) => b.weight - a.weight)
        .slice(0, MAX_WEEKLY_CONTACTS)
        .map((weight) => weight.contact);
    for (let i = newContactQueue.length - 1; i > 0; i--) {
        const j = Math.round(Math.random() * i);
        const temp = newContactQueue[i];
        newContactQueue[i] = newContactQueue[j];
        newContactQueue[j] = temp;
    }
    util_1.log(`Scheduling ${newContactQueue.length} contacts out of ${weights.length} possible contacts`);
    await db_1.setWeeklyQueue(newContactQueue);
    await refreshTimeBuckets();
}
function showNotification() {
    const contact = db_1.dataSource.getQueue().contactQueue[0];
    if (!contact) {
        return;
    }
    const args = { contact };
    util_1.log(`Showing notification for ${args.contact.name}`);
    const { width, height } = electron_1.screen.getPrimaryDisplay().size;
    notificationWindow = new electron_1.BrowserWindow({
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        x: width - NOTIFICATION_WIDTH - 20,
        y: height - NOTIFICATION_HEIGHT - 20,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        webPreferences: {
            additionalArguments: [JSON.stringify(args)]
        }
    });
    notificationWindow.on('closed', () => {
        notificationWindow = null;
    });
    notificationWindow.once('ready-to-show', () => {
        if (notificationWindow) {
            notificationWindow.show();
        }
        setTimeout(() => {
            if (notificationWindow) {
                notificationWindow.close();
            }
        }, NOTIFICATION_DURATION);
    });
    notificationWindow.loadURL(`http://localhost:${util_1.INTERNAL_SERVER_PORT}/notification.html`);
}
//# sourceMappingURL=scheduler.js.map