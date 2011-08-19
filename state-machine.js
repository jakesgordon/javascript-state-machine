StateMachine = {

  //---------------------------------------------------------------------------

  VERSION: "1.3.0",

  //---------------------------------------------------------------------------

  create: function(cfg, target) {

    var initial = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow for a simple string, or an object with { state: 'foo', event: 'setup', defer: true|false }
    var fsm     = target || cfg.target  || {};
    var events  = {};

    var add = function(e) {
      var from = (e.from instanceof Array) ? e.from : [e.from];
      events[e.name] = events[e.name] || {};
      for (var n = 0 ; n < from.length ; n++)
        events[e.name][from[n]] = e;
    };

    if (initial) {
      initial.event = initial.event || 'startup';
      add({ name: initial.event, from: 'none', to: initial.state });
    }

    for(var n = 0 ; n < cfg.events.length ; n++)
      add(cfg.events[n]);

    for(var name in events) {
      if (events.hasOwnProperty(name))
        fsm[name] = StateMachine.buildEvent(name, events[name]);
    }

    fsm.current = 'none';
    fsm.is      = function(state) { return this.current == state; };
    fsm.can     = function(event) { return !!events[event][this.current]; };
    fsm.cannot  = function(event) { return !this.can(event); };

    if (initial && !initial.defer)
      fsm[initial.event]();

    return fsm;

  },

  //===========================================================================

  beforeEvent: function(name, args) {
    var func = this['onbefore' + name];
    if (func && (false === func.apply(this, args)))
      return false;
  },

  exitState: function(from, args) {
    var func = this['onleave' + from];
    if (func)
      func.apply(this, args);
  },

  enterState: function(to, args) {
    var func = this['onenter' + to] || this['on' + to];
    if (func)
      func.apply(this, args);
  },

  changeState: function(from, to, args) {
    var func = this['onchangestate'];
    if (func)
      func.apply(this, [from,to].concat(args));
  },

  afterEvent: function(name, args) {
    var func = this['onafter'  + name] || this['on' + name];
    if (func)
      func.apply(this, args);
  },

  transition: function(from, to, args) {
    this.current = to;
    StateMachine.enterState.call(this, to, args);
    StateMachine.changeState.call(this, from, to, args);
  },

  buildEvent: function(name, map) {
    return function() {

      if (this.cannot(name))
        throw "event " + name + " innapropriate in current state " + this.current;

      var from  = this.current;
      var to    = map[from].to;
      var async = map[from].async;
      var self  = this;
      var args  = Array.prototype.slice.call(arguments);

      if (StateMachine.beforeEvent.call(this, name, args) === false)
        return;

      if (this.current != to) {
        this.transition = function() { StateMachine.transition.call(self, from, to, args); self.transition = null; };
        StateMachine.exitState.call(this, this.current, arguments);
        if (!async)
          this.transition();
      }

      StateMachine.afterEvent.call(this, name, arguments);

    };
  }

  //===========================================================================

};

