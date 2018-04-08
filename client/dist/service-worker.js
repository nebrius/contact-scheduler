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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZpY2VXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDbkVBOzs7Ozs7Ozs7Ozs7Ozs7RUFlRTtBQUVGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBQyxLQUFLO0lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO0lBQ2xDLElBQU0sSUFBSSxHQUFJLEtBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEMsSUFBTSxZQUFZLEdBQStCLElBQVksQ0FBQyxZQUFZLENBQUM7SUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBd0MsSUFBSSxDQUFDLElBQU0sQ0FBQyxDQUFDO0lBQ2pFLElBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBZ0IsSUFBSSxDQUFDLElBQU0sRUFBRTtRQUM5RSxJQUFJO1FBQ0osT0FBTyxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLEtBQUssRUFBRSxTQUFTO2FBQ2pCLEVBQUU7Z0JBQ0QsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLEtBQUssRUFBRSxZQUFZO2FBQ3BCLENBQUM7S0FDSSxDQUFDLENBQUM7SUFDVixZQUFZLENBQUMsS0FBSyxDQUFDLFVBQUMsR0FBRyxJQUFLLGNBQU8sQ0FBQyxHQUFHLENBQUMsaUNBQStCLEdBQUssQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7SUFDOUUsS0FBYSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQ7SUFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFFRCxpQkFBaUIsS0FBVTtJQUN6QixLQUFLLENBQUMsU0FBUyxDQUFFLElBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQzdDLElBQUksRUFBRSxRQUFRO0tBQ2YsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFVBQWU7UUFDdEIsS0FBcUIsVUFBVSxFQUFWLHlCQUFVLEVBQVYsd0JBQVUsRUFBVixJQUFVO1lBQTFCLElBQU0sTUFBTTtZQUNmLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksT0FBTyxJQUFJLE1BQU0sRUFBRTtnQkFDM0MsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkI7U0FDRjtRQUNELElBQUssSUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDcEMsT0FBUSxJQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0RTtJQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBVTtJQUNwRCxNQUFNLEVBQUUsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLFVBQUMsS0FBVTtJQUNwRCxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLFFBQVEsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNwQixLQUFLLFNBQVM7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDZixNQUFNO1FBRVIsS0FBSyxZQUFZO1lBQ2YsVUFBVSxFQUFFLENBQUM7WUFDYixNQUFNO1FBRVI7WUFDRSxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU07S0FDVDtBQUNILENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InNlcnZpY2Utd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3NlcnZpY2VXb3JrZXIudHNcIik7XG4iLCIvKlxuQ29weXJpZ2h0IChDKSAyMDE4IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AbmVicmkudXM+XG5cbkNvbnRhY3QgU2NoZWR1bGFyIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbml0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG50aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cblxuQ29udGFjdCBTY2hlZHVsYXIgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbmJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG5NRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG5HTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuXG5Zb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuYWxvbmcgd2l0aCBDb250YWN0IFNjaGVkdWxhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiovXG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIChldmVudCkgPT4ge1xuICBjb25zb2xlLmxvZygnU2VydmljZSBXb3JrZXIgaW5zdGFsbGluZycpO1xufSk7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignYWN0aXZhdGUnLCAoZXZlbnQpID0+IHtcbiAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIGFjdGl2YXRpbmcnKTtcbn0pO1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ3B1c2gnLCAoZXZlbnQpID0+IHtcbiAgY29uc3QgZGF0YSA9IChldmVudCBhcyBhbnkpLmRhdGEuanNvbigpO1xuICBjb25zdCByZWdpc3RyYXRpb246IFNlcnZpY2VXb3JrZXJSZWdpc3RyYXRpb24gPSAoc2VsZiBhcyBhbnkpLnJlZ2lzdHJhdGlvbjtcbiAgY29uc29sZS5sb2coYFNob3dpbmcgbm90aWZpY2F0aW9uIHRvIHJlYWNoIG91dCB0byAke2RhdGEubmFtZX1gKTtcbiAgY29uc3QgcHJvbWlzZUNoYWluID0gcmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24oYFJlYWNoIG91dCB0byAke2RhdGEubmFtZX1gLCB7XG4gICAgZGF0YSxcbiAgICBhY3Rpb25zOiBbe1xuICAgICAgYWN0aW9uOiAncmVzcG9uZCcsXG4gICAgICB0aXRsZTogJ1Jlc3BvbmQnXG4gICAgfSwge1xuICAgICAgYWN0aW9uOiAncmVzY2hlZHVsZScsXG4gICAgICB0aXRsZTogJ1Jlc2NoZWR1bGUnLFxuICAgIH1dXG4gIH0gYXMgYW55KTtcbiAgcHJvbWlzZUNoYWluLmNhdGNoKChlcnIpID0+IGNvbnNvbGUubG9nKGBFcnJvciBzaG93aW5nIG5vdGlmaWNhdGlvbjogJHtlcnJ9YCkpO1xuICAoZXZlbnQgYXMgYW55KS53YWl0VW50aWwocHJvbWlzZUNoYWluKTtcbn0pO1xuXG5mdW5jdGlvbiBzbm9vemUoKSB7XG4gIGNvbnNvbGUubG9nKCdzbm9vemluZycpO1xufVxuXG5mdW5jdGlvbiByZXNjaGVkdWxlKCkge1xuICBjb25zb2xlLmxvZygncmVzY2hlZHVsaW5nJyk7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbmQoZXZlbnQ6IGFueSkge1xuICBldmVudC53YWl0VW50aWwoKHNlbGYgYXMgYW55KS5jbGllbnRzLm1hdGNoQWxsKHtcbiAgICB0eXBlOiAnd2luZG93J1xuICB9KS50aGVuKChjbGllbnRMaXN0OiBhbnkpID0+IHtcbiAgICBmb3IgKGNvbnN0IGNsaWVudCBvZiBjbGllbnRMaXN0KSB7XG4gICAgICBpZiAoY2xpZW50LnVybCA9PT0gJy8nICYmICdmb2N1cycgaW4gY2xpZW50KSB7XG4gICAgICAgIHJldHVybiBjbGllbnQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKChzZWxmIGFzIGFueSkuY2xpZW50cy5vcGVuV2luZG93KSB7XG4gICAgICByZXR1cm4gKHNlbGYgYXMgYW55KS5jbGllbnRzLm9wZW5XaW5kb3coZXZlbnQubm90aWZpY2F0aW9uLmRhdGEudXJsKTtcbiAgICB9XG4gIH0pKTtcbn1cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdub3RpZmljYXRpb25jbG9zZScsIChldmVudDogYW55KSA9PiB7XG4gIHNub296ZSgpO1xufSk7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbm90aWZpY2F0aW9uY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcbiAgc3dpdGNoIChldmVudC5hY3Rpb24pIHtcbiAgICBjYXNlICdyZXNwb25kJzpcbiAgICAgIHJlc3BvbmQoZXZlbnQpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdyZXNjaGVkdWxlJzpcbiAgICAgIHJlc2NoZWR1bGUoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHNub296ZSgpO1xuICAgICAgYnJlYWs7XG4gIH1cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==