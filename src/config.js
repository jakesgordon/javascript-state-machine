'use strict'

//-------------------------------------------------------------------------------------------------

var mixin    = require('./util/mixin'),
    camelize = require('./util/camelize');

//-------------------------------------------------------------------------------------------------

function Config(options, StateMachine) {

  options = options || {};

  this.options     = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults    = StateMachine.defaults;
  this.states      = [];
  this.transitions = [];
  this.map         = {};
  this.lifecycle   = this.configureLifecycle();
  this.init        = this.configureInitTransition(options.init);
  this.data        = this.configureData(options.data);
  this.methods     = this.configureMethods(options.methods);
  this.hasStateDefs = false;

  this.map[this.defaults.wildcard] = {};

  if (options['statedefs']) {
    this.hasStateDefs = true;
    this.configureStateDefs(options['statedefs']);
  }

  this.configureTransitions(options.transitions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureStateDefs: function(statedefs) {
    var n;
    for (n = 0; n < statedefs.length; n++) {
      this.addState(statedefs[n].name);
    }
  },

  configureTransitions: function(transitions) {
    var i, n, transition, fromStates, from, to, wildcard = this.defaults.wildcard;
    var undefinedStates = [];
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      fromStates  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      if (this.hasStateDefs && to !== wildcard && this.states.indexOf(to) === -1) {
        undefinedStates.push(to);
      }
      for(i = 0 ; i < fromStates.length ; i++) {
        from = fromStates[i];
        if (this.hasStateDefs && from !== wildcard && from !== 'none' &&
            this.states.indexOf(from) === -1) {
          undefinedStates.push(from);
        }
        this.mapTransition({ name: transition.name, from: from, to: to });
      }
    }
    if (undefinedStates.length > 0) {
      throw 'Undefined states in transitions: "' + undefinedStates.join(', ') + '"';
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//-------------------------------------------------------------------------------------------------
