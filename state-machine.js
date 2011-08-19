StateMachine = {

  //---------------------------------------------------------------------------

  VERSION: "2.0.0",

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
    if (func)
      return func.apply(this, args);
  },

  afterEvent: function(name, args) {
    var func = this['onafter'  + name] || this['on' + name];
    if (func)
      return func.apply(this, args);
  },

  leaveState: function(from, args) {
    var func = this['onleave' + from];
    if (func)
      return func.apply(this, args);
  },

  enterState: function(to, args) {
    var func = this['onenter' + to] || this['on' + to];
    if (func)
      return func.apply(this, args);
  },

  changeState: function(from, to, args) {
    var func = this['onchangestate'];
    if (func)
      return func.apply(this, [from,to].concat(args));
  },

  transition: function(name, from, to, args) {
    this.current = to;
    StateMachine.enterState.call(this, to, args);
    StateMachine.changeState.call(this, from, to, args);
    StateMachine.afterEvent.call(this, name, args);
  },

  buildEvent: function(name, map) {
    return function() {

      if (this.transition)
        throw "event " + name + " innapropriate because previous async transition (" + this.transition.event + ") from " + this.transition.from + " to " + this.transition.to + " did not complete"

      if (this.cannot(name))
        throw "event " + name + " innapropriate in current state " + this.current;

      var from  = this.current;
      var to    = map[from].to;
      var async = map[from].async;
      var self  = this;
      var args  = Array.prototype.slice.call(arguments); // turn arguments into pure array

      if (this.current != to) {

        if (false === StateMachine.beforeEvent.call(this, name, args))
          return;

        this.transition       = function() { StateMachine.transition.call(self, name, from, to, args); self.transition = null; };
        this.transition.event = name;
        this.transition.from  = from;
        this.transition.to    = to;

        if (false === StateMachine.leaveState.call(this, this.current, args))
          async = true;

        if (!async && this.transition) // if not async OR user already called transition method (e.g. explicitly in an onleavestate hook)
          this.transition();
      }

    };
  }

  //===========================================================================

};

