/* jshint -W051:true */
/* global jqconsole, Symbol */
/* eslint-disable */
global.DEFINE_MODULE('console', (function () {
  'use strict'
  /* eslint-enable */

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief module "console"
  // /
  // / @file
  // /
  // / DISCLAIMER
  // /
  // / Copyright 2004-2013 triAGENS GmbH, Cologne, Germany
  // /
  // / Licensed under the Apache License, Version 2.0 (the "License")
  // / you may not use this file except in compliance with the License.
  // / You may obtain a copy of the License at
  // /
  // /     http://www.apache.org/licenses/LICENSE-2.0
  // /
  // / Unless required by applicable law or agreed to in writing, software
  // / distributed under the License is distributed on an "AS IS" BASIS,
  // / WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // / See the License for the specific language governing permissions and
  // / limitations under the License.
  // /
  // / Copyright holder is triAGENS GmbH, Cologne, Germany
  // /
  // / @author Dr. Frank Celler
  // / @author Copyright 2010-2013, triAGENS GmbH, Cologne, Germany
  // //////////////////////////////////////////////////////////////////////////////

  var exports = {};
  var internal = require('internal');
  var sprintf = internal.sprintf;
  var inspect = internal.inspect;

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief group level
  // //////////////////////////////////////////////////////////////////////////////

  var groupLevel = '';

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief timers
  // //////////////////////////////////////////////////////////////////////////////

  var timers;
  try {
    timers = Object.create(null);
  } catch (e) {
    timers = {};
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief internal logging
  // //////////////////////////////////////////////////////////////////////////////

  var log;

  if (global.SYS_LOG) {
    // this will work when we are in arangod but not in the browser / web interface
    log = global.SYS_LOG;
    delete global.SYS_LOG;
  } else {
    // this will work in the web interface
    log = function (level, message) {
      if (typeof jqconsole !== 'undefined') {
        jqconsole.Write(message + '\n', 'jssuccess');
      }
    };
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief internal logging with group level
  // //////////////////////////////////////////////////////////////////////////////

  function logGroup (level, msg) {
    log(level, groupLevel + msg);
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief try to prettify
  // //////////////////////////////////////////////////////////////////////////////

  function prepareArgs (args) {
    var result = [];

    if (args.length > 0 && typeof args[0] !== 'string') {
      result.push('%s');
    }

    for (let i = 0; i < args.length; ++i) {
      let arg = args[i];

      if (typeof arg === 'object') {
        if (arg === null) {
          arg = 'null';
        } else if (arg instanceof Error) {
          arg = String(arg);
        } else if (arg instanceof Date || arg instanceof RegExp) {
          arg = String(arg);
        } else if (Object.prototype.isPrototypeOf(arg) || Array.isArray(arg)) {
          arg = inspect(arg, {
            customInspect: true,
            prettyPrint: false
          });
        }
      }

      result.push(arg);
    }

    return result;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief assert
  // //////////////////////////////////////////////////////////////////////////////

  exports.assert = function (condition) {
    if (condition) {
      return;
    }

    var args = Array.prototype.slice.call(arguments, 1);
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(args));
    } catch (e) {
      msg = msg = `${e}: ${args}`;
    }

    logGroup('=error', msg);

    require('assert').ok(condition, msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief debug
  // //////////////////////////////////////////////////////////////////////////////

  exports.debug = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    logGroup('=debug', msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief debugLines
  // //////////////////////////////////////////////////////////////////////////////

  exports.debugLines = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    var a = msg.split('\n');

    for (let i = 0; i < a.length; ++i) {
      logGroup('=debug', a[i]);
    }
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief dir
  // //////////////////////////////////////////////////////////////////////////////

  exports.dir = function (object) {
    logGroup('=info', inspect(object));
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief error
  // //////////////////////////////////////////////////////////////////////////////

  exports.error = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    logGroup('=error', msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief errorLines
  // //////////////////////////////////////////////////////////////////////////////

  exports.errorLines = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    var a = msg.split('\n');
    for (let i = 0; i < a.length; ++i) {
      logGroup('=error', a[i]);
    }
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief getline
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_GETLINE) {
    exports.getline = global.SYS_GETLINE;
    delete global.SYS_GETLINE;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief group
  // //////////////////////////////////////////////////////////////////////////////

  exports.group = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    groupLevel = groupLevel + '  ';
    logGroup('=info', msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief groupCollapsed
  // //////////////////////////////////////////////////////////////////////////////

  exports.groupCollapsed = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    logGroup('=info', msg);
    groupLevel = groupLevel + '  ';
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief groupEnd
  // //////////////////////////////////////////////////////////////////////////////

  exports.groupEnd = function () {
    groupLevel = groupLevel.substr(2);
  };

  // logs with a given topic
  exports.topic = function () {
    var msg;

    var topic = Array.prototype.shift.apply(arguments);

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    logGroup(topic, msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief info
  // //////////////////////////////////////////////////////////////////////////////

  exports.info = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }
    logGroup('=info', msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief infoLines
  // //////////////////////////////////////////////////////////////////////////////

  exports.infoLines = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    var a = msg.split('\n');

    for (let i = 0; i < a.length; ++i) {
      logGroup('=info', a[i]);
    }
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief log
  // //////////////////////////////////////////////////////////////////////////////

  exports.log = exports.info;
  exports._log = log;

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief logLines
  // //////////////////////////////////////////////////////////////////////////////

  exports.logLines = exports.infoLines;

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief time
  // //////////////////////////////////////////////////////////////////////////////

  exports.time = function (label) {
    if (typeof label !== 'string') {
      throw new Error('label must be a string');
    }

    var symbol = typeof Symbol === 'undefined' ? '%' + label : Symbol.for(label);

    timers[symbol] = Date.now();
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief timeEnd
  // //////////////////////////////////////////////////////////////////////////////

  exports.timeEnd = function (label) {
    var symbol = typeof Symbol === 'undefined' ? '%' + label : Symbol.for(label);
    var time = timers[symbol];

    if (!time) {
      throw new Error('No such label: ' + label);
    }

    var duration = Date.now() - time;

    delete timers[symbol];

    logGroup('=info', sprintf('%s: %dms', label, duration));
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief trace
  // //////////////////////////////////////////////////////////////////////////////

  exports.trace = function () {
    var err = new Error();
    err.name = 'Trace';
    err.message = sprintf.apply(sprintf, prepareArgs(arguments));
    Error.captureStackTrace(err, exports.trace);
    var a = err.stack.split('\n');
    while (!a[a.length - 1]) {
      a.pop();
    }
    for (let i = 0; i < a.length; ++i) {
      logGroup('=info', a[i]);
    }
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief warn
  // //////////////////////////////////////////////////////////////////////////////

  exports.warn = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    logGroup('=warning', msg);
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief warnLines
  // //////////////////////////////////////////////////////////////////////////////

  exports.warnLines = function () {
    var msg;

    try {
      msg = sprintf.apply(sprintf, prepareArgs(arguments));
    } catch (e) {
      msg = `${e}: ${arguments}`;
    }

    var a = msg.split('\n');
    var i;

    for (i = 0; i < a.length; ++i) {
      logGroup('=warning', a[i]);
    }
  };

  exports.errorStack = function (e, msg) {
    if (msg) {
      exports.errorLines(msg);
    }
    if (e.codeFrame) {
      exports.errorLines(e.codeFrame);
    }
    let err = e;
    while (err) {
      exports.errorLines(
        !msg && err === e
        ? err.stack
        : `via ${err.stack}`
      );
      err = err.cause;
    }
  };

  exports.warnStack = function (e, msg) {
    if (msg) {
      exports.warnLines(msg);
    }
    if (e.codeFrame) {
      exports.warnLines(e.codeFrame);
    }
    let err = e;
    while (err) {
      exports.warnLines(
        !msg && err === e
        ? err.stack
        : `via ${err.stack}`
      );
      err = err.cause;
    }
  };

  exports.infoStack = function (e, msg) {
    if (msg) {
      exports.infoLines(msg);
    }
    if (e.codeFrame) {
      exports.infoLines(e.codeFrame);
    }
    let err = e;
    while (err) {
      exports.infoLines(
        !msg && err === e
        ? err.stack
        : `via ${err.stack}`
      );
      err = err.cause;
    }
  };

  exports.debugStack = function (e, msg) {
    if (msg) {
      exports.debugLines(msg);
    }
    if (e.codeFrame) {
      exports.debugLines(e.codeFrame);
    }
    let err = e;
    while (err) {
      exports.debugLines(
        !msg && err === e
        ? err.stack
        : `via ${err.stack}`
      );
      err = err.cause;
    }
  };

  return exports;
}()));
