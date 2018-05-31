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
var util_1 = require("./util");
var db_1 = require("./db");
var notifications_1 = require("./notifications");
var DEFAULT_PORT = 3000;
function init(cb) {
    var port = process.env.PORT || DEFAULT_PORT;
    function getRedirectUri() {
        return process.env.NODE_ENV === 'production'
            ? util_1.getEnvironmentVariable('SERVER_HOST') + "/login-success/"
            : "http://localhost:" + port + "/login-success/";
    }
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
            pushPublicKey: util_1.getEnvironmentVariable('PUSH_PUBLIC_KEY'),
            user: JSON.stringify(db_1.getUser(req.userId))
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
        notifications_1.processNotifications(function (err) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                res.send({ status: 'ok' });
            }
        });
    });
    app.post('/api/rescheduleNotification', auth.createMiddleware(false), function (req, res) {
        notifications_1.rescheduleCurrentNotification(req.userId, function (err) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                res.send({ status: 'ok' });
            }
        });
    });
    app.post('/api/respondToNotification', auth.createMiddleware(false), function (req, res) {
        notifications_1.respondToCurrentNotification(req.userId, function (err) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }
            else {
                res.send({ status: 'ok' });
            }
        });
    });
    app.listen(port, function () {
        console.log("API server listening on port " + port + ".");
        cb(undefined);
    });
}
exports.init = init;
//# sourceMappingURL=endpoints.js.map