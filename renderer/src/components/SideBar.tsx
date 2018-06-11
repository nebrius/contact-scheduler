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
import * as classnames from 'classnames';
import { Tab } from '../util/types';

export interface IStateProps {
  activeTab: Tab;
}

export type IDispatchProps = {
  navigateToHome: () => void;
  navigateToContacts: () => void;
  navigateToCalendars: () => void;
}

export type IProps = IStateProps & IDispatchProps;

export function SideBar(props: IProps): JSX.Element {
  function getClassnames(tab: Tab): string {
    return classnames('button', { 'button-selected': props.activeTab === tab });
  }
  return (
    <div className="side-bar-container">
      <button type="button" className={getClassnames('home')} onClick={props.navigateToHome}>
        <i className="fas fa-home fa-2x"></i>
      </button>
      <button type="button" className={getClassnames('contacts')} onClick={props.navigateToContacts}>
        <i className="fas fa-address-card fa-2x"></i>
      </button>
      <button type="button" className={getClassnames('calendars')} onClick={props.navigateToCalendars}>
        <i className="fas fa-calendar-alt fa-2x"></i>
      </button>
    </div>
  );
}
