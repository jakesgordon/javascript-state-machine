'use strict'

//-----------------------------------------------------------------------------------------------

var mixin    = require('./util/mixin'),
    camelize = require('./util/camelize'),
    plugin   = require('./plugin'),
    Config   = require('./config'),
    JSM      = require('./jsm');

//-----------------------------------------------------------------------------------------------

var PublicMethods = {
  is:                  function(state)       { return this._fsm.is(state)                                     },
  can:                 function(transition)  { return this._fsm.can(transition)                               },
  cannot:              function(transition)  { return this._fsm.cannot(transition)                            },
  observe:             function()            { return this._fsm.observe(arguments)                            },
  transitions:         function()            { return this._fsm.transitions()                                 },
  allTransitions:      function()            { return this._fsm.allTransitions()                              },
  allStates:           function()            { return this._fsm.allStates()                                   },
  onInvalidTransition: function(t, from, to) { return this._fsm.onInvalidTransition(t, from, to)              },
  onPendingTransition: function(t, from, to) { return this._fsm.onPendingTransition(t, from, to)              },
}

var PublicProperties = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      throw Error('use transitions to change state')
    }
  }
}

var PublicPropertiesWritable = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      var fsm = this._fsm;

      if (state === this._fsm.state) {
        return
      }
      var availableTransitions = fsm.config.options.transitions.filter(function(transition) {
        return (transition.from === fsm.state)
          && (typeof transition.to === 'function' ? transition.to() === state : transition.to === state)
      });
      if (!availableTransitions.length) {
        var availableWildCardTransitions = fsm.config.options.transitions.filter(function(transition) {
          return (transition.from ===  fsm.config.defaults.wildcard)
            && (typeof transition.to === 'function' ? transition.to(state) === state : transition.to === state)
        });
        if (availableWildCardTransitions.length > 0) {
          var wildCardTransition = availableWildCardTransitions[0];
          return this[wildCardTransition.name](state)
        }
        throw Error('no transitions to state \'' + state + '\' allowed')
      }
      if (availableTransitions.length > 1) {
        throw Error('multiple transitions to \'' + state + '\' possible.')
      }
      var transition = availableTransitions[0]
      this[transition.name]()
    }
  }
}

//-----------------------------------------------------------------------------------------------

function StateMachine(options) {
  return apply(this || {}, options);
}

function factory() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._fsm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
  return cstor;
}

//-------------------------------------------------------------------------------------------------

function apply(instance, options) {
  var config = new Config(options, StateMachine);
  build(instance, config);
  instance._fsm();
  return instance;
}

function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = function() {
    this._fsm = new JSM(this, config);
    this._fsm.init(arguments);
  }
}

//-------------------------------------------------------------------------------------------------

function StateMachineBaseClass() {
  var target = this;

  var options = {
    transitions: target.constructor.stateTransitions,
    init: target.constructor.initialState,
    methods: target
  };
  var config = new Config(options, StateMachine);

  plugin.build(target, config);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = new JSM(target, config);
  target._fsm.init();
  Object.defineProperties(target, PublicPropertiesWritable);
  return target;
}

//-----------------------------------------------------------------------------------------------

StateMachine.version  = '3.0.0-rc.1';
StateMachine.factory  = factory;
StateMachine.apply    = apply;
StateMachine.es6      = StateMachineBaseClass;
StateMachine.defaults = {
  wildcard: '*',
  init: {
    name: 'init',
    from: 'none'
  }
}

//===============================================================================================

module.exports = StateMachine;
