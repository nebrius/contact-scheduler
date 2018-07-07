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

export type IDispatchProps = {} // No dispatch props (yet?)

export type IProps = IStateProps & IDispatchProps;

export function ContactQueue(props: IProps): JSX.Element {
  let contents: JSX.Element;
  if (props.contactQueue.length) {
    contents = (
      <div className="contact-queue">
        <div className="contact-queue-title"><h3>Queue</h3></div>
        <div>{props.contactQueue.map((contact) => (
          <div key={contact.id} className="contact-queue-entry-container">{contact.name}</div>
        ))}</div>
      </div>
    );
  } else {
    contents = (
      <div className="contact-queue-empty">
        <h3>No one else to contact this week</h3>
      </div>
    );
  }
  return (
    <div className="contact-queue-container">
      {contents}
    </div>
  );
}
