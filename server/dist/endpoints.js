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
var express = require("express");
var body_parser_1 = require("body-parser");
var cookieParser = require("cookie-parser");
var express_facebook_auth_1 = require("express-facebook-auth");
var async_1 = require("async");
var web_push_1 = require("web-push");
var types_1 = require("./common/types");
var util_1 = require("./util");
var db_1 = require("./db");
var DEFAULT_PORT = 3000;
var HOUR_IN_MS = 60 * 60 * 1000;
var BUCKET_DURATION = HOUR_IN_MS;
var MONTHLY_THRESHOLD = HOUR_IN_MS * 24 * 25;
var QUARTERLY_THRESHOLD = HOUR_IN_MS * 24 * 80;
function init(cb) {
    var port = process.env.PORT || DEFAULT_PORT;
    function getRedirectUri() {
        return process.env.NODE_ENV === 'production'
            ? util_1.getEnvironmentVariable('SERVER_HOST') + "/login-success/"
            : "http://localhost:" + port + "/login-success/";
    }
    web_push_1.setVapidDetails('mailto:bryan@nebri.us', util_1.getEnvironmentVariable('PUSH_PUBLIC_KEY'), util_1.getEnvironmentVariable('PUSH_PRIVATE_KEY'));
    var app = express();
    app.use(body_parser_1.json());
    app.use(cookieParser());
    if (process.env.HOST_CLIENT === 'true') {
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path_1.join(__dirname, '..', 'client')));
        }
        else {
            app.use(express.static(path_1.join(__dirname, '..', '..', 'client', 'dist')));
        }
    }
    app.set('view engine', 'pug');
    app.set('views', path_1.join(__dirname, '..', 'views'));
    var auth = new express_facebook_auth_1.Authenticator({
        facebookAppId: util_1.getEnvironmentVariable('FACEBOOK_APP_ID'),
        facebookAppSecret: util_1.getEnvironmentVariable('FACEBOOK_APP_SECRET'),
        isUserRegistered: db_1.isUserRegistered,
        loginUri: '/login',
        redirectUri: getRedirectUri()
    });
    app.get('/login', function (req, res) {
        console.log('endpoints: Serving GET:/login');
        res.render('login', {
            facebookAppId: util_1.getEnvironmentVariable('FACEBOOK_APP_ID'),
            redirectUri: getRedirectUri()
        });
    });
    auth.createLoginSuccessEndpoint(app);
    app.get('/', auth.createMiddleware(true), function (req, res) {
        console.log('endpoints: Serving GET:/');
        res.render('index', {
            pushPublicKey: util_1.getEnvironmentVariable('PUSH_PUBLIC_KEY')
        });
    });
    app.get('/notificationClicked', auth.createMiddleware(true), function (req, res) {
        res.send('You clicked a notification!');
    });
    app.get('/api/contacts', auth.createMiddleware(false), function (req, res) {
        console.log('endpoints: Serving GET:/api/contacts');
        res.send(db_1.getContacts(req.userId));
    });
    app.post('/api/contacts', auth.createMiddleware(false), function (req, res) {
        console.log('endpoints: Serving POST:/api/contacts');
        var _a = req, userId = _a.userId, contacts = _a.body.contacts;
        console.log(userId, contacts);
        db_1.setContacts(userId, contacts, function (err) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                res.send({ status: 'ok' });
            }
        });
    });
    app.post('/api/pushSubscription', auth.createMiddleware(false), function (req, res) {
        console.log('endpoints: Serving POST:/api/pushSubscription');
        var _a = req, userId = _a.userId, pushSubscription = _a.body;
        db_1.setPushSubscription(userId, pushSubscription, function (err) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                res.send({ status: 'ok' });
            }
        });
    });
    app.post('/api/processNotifications', function (req, res) {
        var users = db_1.getUsers();
        async_1.parallel(users.map(function (user) { return function (next) {
            var midnight = util_1.getStartOfToday(user.settings.timezone);
            // const dayOfWeek = (new Date(midnight)).getDay();
            // if (dayOfWeek === 0 || dayOfWeek === 6) {
            //   console.log('skipping due to the weekend');
            //   next(undefined);
            //   return;
            // }
            async_1.series([
                function (weeklyContactListNext) {
                    if (user.state.weeklyContactListUpdated > util_1.getStartOfWeek(user.settings.timezone)) {
                        weeklyContactListNext();
                        return;
                    }
                    console.log('Creating the list of people to contact');
                    var peopleToContact = [];
                    for (var _i = 0, _a = user.contacts; _i < _a.length; _i++) {
                        var contact = _a[_i];
                        switch (contact.frequency) {
                            case types_1.Frequency.Weekly:
                                peopleToContact.push(contact);
                                break;
                            case types_1.Frequency.Monthly:
                                if (contact.lastContacted + MONTHLY_THRESHOLD < midnight) {
                                    peopleToContact.push(contact);
                                }
                                break;
                            case types_1.Frequency.Quarterly:
                                if (contact.lastContacted + QUARTERLY_THRESHOLD < midnight) {
                                    peopleToContact.push(contact);
                                }
                                break;
                        }
                    }
                    var shuffledPeopleToContact = [];
                    while (peopleToContact.length) {
                        var i = Math.round(Math.random() * (peopleToContact.length - 1));
                        shuffledPeopleToContact.push(peopleToContact.splice(i, 1)[0]);
                    }
                    db_1.setWeeklyContactList(user.id, shuffledPeopleToContact, weeklyContactListNext);
                },
                function (bucketsNext) {
                    if (user.state.dailyBucketsUpdated >= midnight) {
                        bucketsNext();
                        return;
                    }
                    console.log('Creating the daily buckets');
                    var startOfToday = midnight + user.settings.startOfDay * HOUR_IN_MS;
                    var endOfToday = midnight + user.settings.endOfDay * HOUR_IN_MS;
                    var buckets = [];
                    for (var timestamp = startOfToday; timestamp < endOfToday; timestamp += BUCKET_DURATION) {
                        buckets.push({
                            timestamp: timestamp,
                            available: true // TODO: hook in calendar information
                        });
                    }
                    db_1.setDailyBuckets(user.id, buckets, bucketsNext);
                },
                function (processNext) {
                    console.log('Processing next bucket');
                    processNext();
                }
            ], next);
        }; }), function (err) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                res.send({ status: 'ok' });
            }
        });
    });
    app.post('/api/snoozeNotification', auth.createMiddleware(false), function (req, res) {
        // TODO
    });
    app.post('/api/rescheduleNotification', auth.createMiddleware(false), function (req, res) {
        // TODO
    });
    app.post('/api/respondToNotification', auth.createMiddleware(false), function (req, res) {
        // TODO
    });
    app.post('/api/createNotification', auth.createMiddleware(false), function (req, res) {
        var pushSubscription = db_1.getPushSubscription(req.userId);
        web_push_1.sendNotification(pushSubscription, JSON.stringify({
            name: 'Faruk Ates',
            url: 'https://www.messenger.com/t/farukates'
        })).then(function () {
            console.log('sent!');
            res.send({ status: 'ok' });
        }).catch(function (sendErr) {
            console.log(sendErr);
            res.sendStatus(500);
        });
    });
    app.listen(port, function () {
        console.log("API server listening on port " + port + ".");
        cb(undefined);
    });
}
exports.init = init;
//# sourceMappingURL=endpoints.js.map