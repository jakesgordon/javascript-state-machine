StateMachine = {

  //---------------------------------------------------------------------------

  VERSION: "2.0.1",

  //---------------------------------------------------------------------------

  Error: {
    INVALID_TRANSITION: 100, // caller tried to fire an event that was innapropriate in the current state
    PENDING_TRANSITION: 200, // caller tried to fire an event while an async transition was still pending
    INVALID_CALLBACK:   300, // caller provided callback function threw an exception
  },

  //---------------------------------------------------------------------------

  create: function(cfg, target) {

    var initial   = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow for a simple string, or an object with { state: 'foo', event: 'setup', defer: true|false }
    var fsm       = target || cfg.target  || {};
    var events    = cfg.events || [];
    var callbacks = cfg.callbacks || {};
    var map       = {};

    var add = function(e) {
      var from = (e.from instanceof Array) ? e.from : [e.from];
      map[e.name] = map[e.name] || {};
      for (var n = 0 ; n < from.length ; n++)
        map[e.name][from[n]] = e.to || from[n]; // allow no-op transition if 'to' is not specified
    };

    if (initial) {
      initial.event = initial.event || 'startup';
      add({ name: initial.event, from: 'none', to: initial.state });
    }

    for(var n = 0 ; n < events.length ; n++)
      add(events[n]);

    for(var name in map) {
      if (map.hasOwnProperty(name))
        fsm[name] = StateMachine.buildEvent(name, map[name]);
    }

    for(var name in callbacks) {
      if (callbacks.hasOwnProperty(name))
        fsm[name] = callbacks[name]
    }

    fsm.current = 'none';
    fsm.is      = function(state) { return this.current == state; };
    fsm.can     = function(event) { return !!map[event][this.current] && !this.transition; };
    fsm.cannot  = function(event) { return !this.can(event); };
    fsm.error   = cfg.error || function(name, from, to, args, error, msg) { throw msg; }; // default behavior when something unexpected happens is to throw an exception, but caller can override this behavior if desired (see github issue #3)

    if (initial && !initial.defer)
      fsm[initial.event]();

    return fsm;

  },

  //===========================================================================

  doCallback: function(fsm, func, name, from, to, args) {
    if (func) {
      try {
        return func.apply(fsm, [name, from, to].concat(args));
      }
      catch(e) {
        return fsm.error(name, from, to, args, StateMachine.Error.INVALID_CALLBACK, "an exception occurred in a caller-provided callback function");
      }
    }
  },

  beforeEvent: function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbefore' + name],                     name, from, to, args); },
  afterEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafter'  + name] || fsm['on' + name], name, from, to, args); },
  leaveState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleave'  + from],                     name, from, to, args); },
  enterState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenter'  + to]   || fsm['on' + to],   name, from, to, args); },
  changeState: function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onchangestate'],                       name, from, to, args); },


  buildEvent: function(name, map) {
    return function() {

      if (this.transition)
        return this.error(name, from, to, args, StateMachine.Error.PENDING_TRANSITION, "event " + name + " inappropriate because previous transition did not complete");

      if (this.cannot(name))
        return this.error(name, from, to, args, StateMachine.Error.INVALID_TRANSITION, "event " + name + " inappropriate in current state " + this.current);

      var from  = this.current;
      var to    = map[from];
      var args  = Array.prototype.slice.call(arguments); // turn arguments into pure array

      if (false === StateMachine.beforeEvent(this, name, from, to, args))
        return;

      if (from !== to) {

        var fsm = this;
        this.transition = function() { // prepare transition method for use either lower down, or by caller if they want an async transition (indicated by a false return value from leaveState)
          fsm.transition = null; // this method should only ever be called once
          fsm.current = to;
          StateMachine.enterState( fsm, name, from, to, args);
          StateMachine.changeState(fsm, name, from, to, args);
          StateMachine.afterEvent( fsm, name, from, to, args);
        };

        if (false !== StateMachine.leaveState(this, name, from, to, args)) {
          if (this.transition) // in case user manually called it but forgot to return false
            this.transition();
        }

        return; // transition method took care of (or, if async, will take care of) the afterEvent, DONT fall through
      }

      StateMachine.afterEvent(this, name, from, to, args); // this is only ever called if there was NO transition (e.g. if from === to)

    };
  }

  //===========================================================================

};

