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

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { connectToInfrastructureServer } from '@nebrius/electron-infrastructure-renderer';
import { NotificationRootContainer } from './containers/NotificationRootContainer';
import { notificationStore } from './stores/notificationStore';
import { INTERNAL_SERVER_PORT } from './common/config';
import { WindowTypes } from './common/messages';

(async () => {
  await connectToInfrastructureServer(WindowTypes.Notifications, INTERNAL_SERVER_PORT);
  render(
    (
      <Provider store={notificationStore}>
        <NotificationRootContainer />
      </Provider>
    ),
    document.getElementById('root')
  );
})();
