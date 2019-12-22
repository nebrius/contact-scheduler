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
export function ContactQueue(props) {
    let contents;
    if (props.contactQueue.length) {
        contents = (React.createElement("div", { className: "contact-queue" },
            React.createElement("div", { className: "contact-queue-title" },
                React.createElement("h3", null, "Queue")),
            React.createElement("div", null, props.contactQueue.map((contact) => (React.createElement("div", { key: contact.id, className: "contact-queue-entry-container" }, contact.name))))));
    }
    else {
        contents = (React.createElement("div", { className: "contact-queue-empty" },
            React.createElement("h3", null, "No one else to contact this week")));
    }
    return (React.createElement("div", { className: "contact-queue-container" }, contents));
}
//# sourceMappingURL=ContactQueue.js.map