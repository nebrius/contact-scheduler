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
import { IContact } from '../common/types';

export interface IStateProps {
  contactQueue: IContact[];
}

export type IDispatchProps = {
  openContactsDialog: () => void;
}

export type IProps = IStateProps & IDispatchProps;

export function DailyContactQueue(props: IProps): JSX.Element {
  let contents: JSX.Element;
  if (props.contactQueue.length) {
    contents = (
      <div className="daily-contact-queue">
        <div className="daily-contact-queue-title"><h2>Today's Contacts</h2></div>
        <div>Queue</div>
      </div>
    );
  } else {
    contents = (
      <div className="daily-contact-queue-empty">
        <h3>No one else to contact today</h3>
      </div>
    );
  }
  return (
    <div className="daily-contact-queue-container">
      {contents}
      <div className="daily-contact-queue-footer">
        <button type="button" className="btn btn-outline-primary btn-lg" onClick={props.openContactsDialog}>Edit Contacts List</button>
      </div>
    </div>
  );
}
