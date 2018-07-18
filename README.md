# Contact Scheduler

A system for scheduling times to reach out to folks regularly that takes into account my anxiety and other brain quirks.

This app is currently still pre-beta. If you would like to try this app out, you'll need to jump through a few hoops. Run these instructions from the command line, and it _should_ work:

```
git clone https://github.com/nebrius/contact-scheduler.git
cd contact-scheduler
npm install
./node_modules/.bin/electron-rebuild
npm start
```

If you're on Windows, you'll need to set up a shortcut for notifications to work: https://github.com/nadavbar/node-win-shortcut. This _should_ work on macOS without any extra steps, but I haven't tested it yet.

# License

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
