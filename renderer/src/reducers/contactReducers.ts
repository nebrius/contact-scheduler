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

import { Reducer } from 'redux';
import { IAction } from '../actions/actions';
import { IContactState } from '../util/types';
import { IContactDialogArguments } from '../common/arguments';

const initArgs: IContactDialogArguments = JSON.parse(process.argv.pop() as string);

const DEFAULT_STATE: IContactState = {
  contact: {
    id: NaN,
    name: '',
    frequency: 'weekly'
  },
  isAdd: initArgs.isAdd
};

export const contactReducers: Reducer<IContactState> = (state: IContactState | undefined, action: IAction) => {
  if (!state) {
    state = DEFAULT_STATE;
  }
  return state;
};
