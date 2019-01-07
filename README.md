# Contact Scheduler

A system for scheduling times to reach out to folks regularly that takes into account my anxiety and other brain quirks.

This app is currently still pre-beta. If you would like to try this app out, you'll need to jump through a few hoops. Run these instructions from the command line, and it _should_ work:

```
git clone https://github.com/nebrius/contact-scheduler.git
cd contact-scheduler
npm install
cd renderer
npm install
cd ../main
npm install
cd ..
npm run electron-rebuild
npm run build
npm start
```

**If you're on Windows:**

You'll first need to install the VS build tools. Note that you need VS 2015 tools, not VS 2017 tools to build the sqlite3 dependency. Install them with:

```
npm install --vs2015 -g windows-build-tools
```

You'll also need to set up a shortcut for notifications to work: https://github.com/nadavbar/node-win-shortcut. Instructions on how to use that module to create the shortcut are coming soon, just as soon as I remember how I did it the first time 😅.

**If you're on Linux or macOS:**

This _should_ work on macOS and Linux without any extra steps, but I haven't tested it yet so YMMV. If you run into any problems, please file an issue.

# License

Copyright (C) Bryan Hughes <bryan@nebri.us>

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
