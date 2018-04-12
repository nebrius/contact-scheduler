/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/serviceWorker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/serviceWorker.ts":
/*!******************************!*\
  !*** ./src/serviceWorker.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
self.addEventListener('install', function (event) {
    console.log('Service Worker installing');
});
self.addEventListener('activate', function (event) {
    console.log('Service Worker activating');
});
self.addEventListener('push', function (event) {
    var data = event.data.json();
    var registration = self.registration;
    console.log("Showing notification to reach out to " + data.name);
    var promiseChain = registration.showNotification("Reach out to " + data.name, {
        data: data,
        actions: [{
                action: 'respond',
                title: 'Respond'
            }, {
                action: 'reschedule',
                title: 'Reschedule',
            }]
    });
    promiseChain.catch(function (err) { return console.log("Error showing notification: " + err); });
    event.waitUntil(promiseChain);
});
function snooze() {
    console.log('snoozing');
}
function reschedule() {
    console.log('rescheduling');
}
function respond(event) {
    event.waitUntil(self.clients.matchAll({
        type: 'window'
    }).then(function (clientList) {
        for (var _i = 0, clientList_1 = clientList; _i < clientList_1.length; _i++) {
            var client = clientList_1[_i];
            if (client.url === '/' && 'focus' in client) {
                return client.focus();
            }
        }
        if (self.clients.openWindow) {
            return self.clients.openWindow(event.notification.data.url);
        }
    }));
}
self.addEventListener('notificationclose', function (event) {
    snooze();
});
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    switch (event.action) {
        case 'respond':
            respond(event);
            break;
        case 'reschedule':
            reschedule();
            break;
        default:
            snooze();
            break;
    }
});


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDbkVBOzs7Ozs7Ozs7Ozs7Ozs7RUFlRTtBQUVGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBQyxLQUFLO0lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO0lBQ2xDLElBQU0sSUFBSSxHQUFJLEtBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEMsSUFBTSxZQUFZLEdBQStCLElBQVksQ0FBQyxZQUFZLENBQUM7SUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBd0MsSUFBSSxDQUFDLElBQU0sQ0FBQyxDQUFDO0lBQ2pFLElBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBZ0IsSUFBSSxDQUFDLElBQU0sRUFBRTtRQUM5RSxJQUFJO1FBQ0osT0FBTyxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLEtBQUssRUFBRSxTQUFTO2FBQ2pCLEVBQUU7Z0JBQ0QsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLEtBQUssRUFBRSxZQUFZO2FBQ3BCLENBQUM7S0FDSSxDQUFDLENBQUM7SUFDVixZQUFZLENBQUMsS0FBSyxDQUFDLFVBQUMsR0FBRyxJQUFLLGNBQU8sQ0FBQyxHQUFHLENBQUMsaUNBQStCLEdBQUssQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7SUFDOUUsS0FBYSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQ7SUFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFFRCxpQkFBaUIsS0FBVTtJQUN6QixLQUFLLENBQUMsU0FBUyxDQUFFLElBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQzdDLElBQUksRUFBRSxRQUFRO0tBQ2YsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFVBQWU7UUFDdEIsS0FBcUIsVUFBVSxFQUFWLHlCQUFVLEVBQVYsd0JBQVUsRUFBVixJQUFVO1lBQTFCLElBQU0sTUFBTTtZQUNmLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksT0FBTyxJQUFJLE1BQU0sRUFBRTtnQkFDM0MsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkI7U0FDRjtRQUNELElBQUssSUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDcEMsT0FBUSxJQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0RTtJQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBVTtJQUNwRCxNQUFNLEVBQUUsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBVTtJQUNwRCxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLFFBQVEsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNwQixLQUFLLFNBQVM7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDZixNQUFNO1FBRVIsS0FBSyxZQUFZO1lBQ2YsVUFBVSxFQUFFLENBQUM7WUFDYixNQUFNO1FBRVI7WUFDRSxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU07S0FDVDtBQUNILENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InNlcnZpY2VXb3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvc2VydmljZVdvcmtlci50c1wiKTtcbiIsIi8qXG5Db3B5cmlnaHQgKEMpIDIwMTggQnJ5YW4gSHVnaGVzIDxicnlhbkBuZWJyaS51cz5cblxuQ29udGFjdCBTY2hlZHVsYXIgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbnRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4oYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuXG5Db250YWN0IFNjaGVkdWxhciBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2Zcbk1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbkdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG5cbllvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG5hbG9uZyB3aXRoIENvbnRhY3QgU2NoZWR1bGFyLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuKi9cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgKGV2ZW50KSA9PiB7XG4gIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFdvcmtlciBpbnN0YWxsaW5nJyk7XG59KTtcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdhY3RpdmF0ZScsIChldmVudCkgPT4ge1xuICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgYWN0aXZhdGluZycpO1xufSk7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigncHVzaCcsIChldmVudCkgPT4ge1xuICBjb25zdCBkYXRhID0gKGV2ZW50IGFzIGFueSkuZGF0YS5qc29uKCk7XG4gIGNvbnN0IHJlZ2lzdHJhdGlvbjogU2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbiA9IChzZWxmIGFzIGFueSkucmVnaXN0cmF0aW9uO1xuICBjb25zb2xlLmxvZyhgU2hvd2luZyBub3RpZmljYXRpb24gdG8gcmVhY2ggb3V0IHRvICR7ZGF0YS5uYW1lfWApO1xuICBjb25zdCBwcm9taXNlQ2hhaW4gPSByZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihgUmVhY2ggb3V0IHRvICR7ZGF0YS5uYW1lfWAsIHtcbiAgICBkYXRhLFxuICAgIGFjdGlvbnM6IFt7XG4gICAgICBhY3Rpb246ICdyZXNwb25kJyxcbiAgICAgIHRpdGxlOiAnUmVzcG9uZCdcbiAgICB9LCB7XG4gICAgICBhY3Rpb246ICdyZXNjaGVkdWxlJyxcbiAgICAgIHRpdGxlOiAnUmVzY2hlZHVsZScsXG4gICAgfV1cbiAgfSBhcyBhbnkpO1xuICBwcm9taXNlQ2hhaW4uY2F0Y2goKGVycikgPT4gY29uc29sZS5sb2coYEVycm9yIHNob3dpbmcgbm90aWZpY2F0aW9uOiAke2Vycn1gKSk7XG4gIChldmVudCBhcyBhbnkpLndhaXRVbnRpbChwcm9taXNlQ2hhaW4pO1xufSk7XG5cbmZ1bmN0aW9uIHNub296ZSgpIHtcbiAgY29uc29sZS5sb2coJ3Nub296aW5nJyk7XG59XG5cbmZ1bmN0aW9uIHJlc2NoZWR1bGUoKSB7XG4gIGNvbnNvbGUubG9nKCdyZXNjaGVkdWxpbmcnKTtcbn1cblxuZnVuY3Rpb24gcmVzcG9uZChldmVudDogYW55KSB7XG4gIGV2ZW50LndhaXRVbnRpbCgoc2VsZiBhcyBhbnkpLmNsaWVudHMubWF0Y2hBbGwoe1xuICAgIHR5cGU6ICd3aW5kb3cnXG4gIH0pLnRoZW4oKGNsaWVudExpc3Q6IGFueSkgPT4ge1xuICAgIGZvciAoY29uc3QgY2xpZW50IG9mIGNsaWVudExpc3QpIHtcbiAgICAgIGlmIChjbGllbnQudXJsID09PSAnLycgJiYgJ2ZvY3VzJyBpbiBjbGllbnQpIHtcbiAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKHNlbGYgYXMgYW55KS5jbGllbnRzLm9wZW5XaW5kb3cpIHtcbiAgICAgIHJldHVybiAoc2VsZiBhcyBhbnkpLmNsaWVudHMub3BlbldpbmRvdyhldmVudC5ub3RpZmljYXRpb24uZGF0YS51cmwpO1xuICAgIH1cbiAgfSkpO1xufVxuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGlmaWNhdGlvbmNsb3NlJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgc25vb3plKCk7XG59KTtcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdub3RpZmljYXRpb25jbGljaycsIChldmVudDogYW55KSA9PiB7XG4gIGV2ZW50Lm5vdGlmaWNhdGlvbi5jbG9zZSgpO1xuICBzd2l0Y2ggKGV2ZW50LmFjdGlvbikge1xuICAgIGNhc2UgJ3Jlc3BvbmQnOlxuICAgICAgcmVzcG9uZChldmVudCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3Jlc2NoZWR1bGUnOlxuICAgICAgcmVzY2hlZHVsZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgc25vb3plKCk7XG4gICAgICBicmVhaztcbiAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6IiJ9