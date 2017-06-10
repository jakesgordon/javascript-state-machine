(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("StateMachineHistory", [], factory);
	else if(typeof exports === 'object')
		exports["StateMachineHistory"] = factory();
	else
		root["StateMachineHistory"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

function camelize(label) {

  if (label.length === 0)
    return label;

  var n, result, word, words = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  result = words[0].toLowerCase();
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
  }

  return result;
}

//-------------------------------------------------------------------------------------------------

camelize.prepended = function(prepend, label) {
  label = camelize(label);
  return prepend + label[0].toUpperCase() + label.substring(1);
}

//-------------------------------------------------------------------------------------------------

module.exports = camelize;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var camelize = __webpack_require__(0);

//-------------------------------------------------------------------------------------------------

module.exports = function(options) { options = options || {};

  var past       = camelize(options.name || options.past   || 'history'),
      future     = camelize(                options.future || 'future'),
      clear      = camelize.prepended('clear', past),
      back       = camelize.prepended(past,   'back'),
      forward    = camelize.prepended(past,   'forward'),
      canBack    = camelize.prepended('can',   back),
      canForward = camelize.prepended('can',   forward),
      max        = options.max;

  var plugin = {

    configure: function(config) {
      config.addTransitionLifecycleNames(back);
      config.addTransitionLifecycleNames(forward);
    },

    init: function(instance) {
      instance[past]   = [];
      instance[future] = [];
    },

    lifecycle: function(instance, lifecycle) {
      if (lifecycle.event === 'onEnterState') {
        instance[past].push(lifecycle.to);
        if (max && instance[past].length > max)
          instance[past].shift();
        if (lifecycle.transition !== back && lifecycle.transition !== forward)
          instance[future].length = 0;
      }
    },

    methods:    {},
    properties: {}

  }

  plugin.methods[clear] = function() {
    this[past].length = 0
    this[future].length = 0
  }

  plugin.properties[canBack] = {
    get: function() {
      return this[past].length > 1
    }
  }

  plugin.properties[canForward] = {
    get: function() {
      return this[future].length > 0
    }
  }

  plugin.methods[back] = function() {
    if (!this[canBack])
      throw Error('no history');
    var from = this[past].pop(),
        to   = this[past].pop();
    this[future].push(from);
    this._fsm.transit(back, from, to, []);
  }

  plugin.methods[forward] = function() {
    if (!this[canForward])
      throw Error('no history');
    var from = this.state,
        to = this[future].pop();
    this._fsm.transit(forward, from, to, []);
  }

  return plugin;

}


/***/ })
/******/ ]);
});