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
import * as React from "react";
export function NotificationRoot(props) {
    return (React.createElement("div", { className: "notification-container" },
        React.createElement("button", { className: "notification-close btn btn-dark", onClick: props.close }, "X"),
        React.createElement("div", { className: "notification-contents-container" },
            React.createElement("div", { className: "notification-contents-body" },
                "Reach out to ",
                props.contact.name),
            React.createElement("button", { className: "btn btn-success", onClick: () => props.respond(props.contact) }, "Responded"),
            React.createElement("button", { className: "btn btn-secondary", onClick: () => props.pushToBack(props.contact) }, "Push to Back"))));
}
//# sourceMappingURL=NotificationRoot.js.map