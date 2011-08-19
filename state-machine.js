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
    }

    if (initial) {
      initial.event = initial.event || 'startup';
      add({ name: initial.event, from: 'none', to: initial.state });
    }

    for(var n = 0 ; n < cfg.events.length ; n++)
      add(cfg.events[n]);

    for(var name in events) {
      if (events.hasOwnProperty(name))
        fsm[name] = this.buildEvent(name, events[name]);
    }

    fsm.current = 'none';
    fsm.is      = function(state) { return this.current == state; };
    fsm.can     = function(event) { return !!events[event][this.current]; };
    fsm.cannot  = function(event) { return !this.can(event); };

    if (initial && !initial.defer)
      fsm[initial.event]();

    return fsm;
  },

  //---------------------------------------------------------------------------

  buildEvent: function(name, map) {

    var beforeEvent = function(name, args) {
      var func = this['onbefore' + name];
      if (func && (false === func.apply(this, args)))
        return false;
    };

    var exitState = function(from, args) {
      var func = this['onleave' + from];
      if (func)
        func.apply(this, args);
    };

    var enterState = function(to, args) {
      var func = this['onenter' + to] || this['on' + to];
      if (func)
        func.apply(this, args);
    };

    var changeState = function(from, to, args) {
      var func = this['onchangestate'];
      if (func)
        func.call(this, from, to);
    };

    var afterEvent = function(name, args) {
      var func = this['onafter'  + name] || this['on' + name];
      if (func)
        func.apply(this, args);
    };

    var transition = function(from, to, args) {
      this.current = to;
      enterState.call(this, to, args);
      changeState.call(this, from, to);
    };

    return function() {

      if (this.cannot(name))
        throw "event " + name + " innapropriate in current state " + this.current;

      var from  = this.current;
      var to    = map[from].to;
      var async = map[from].async;

      if (beforeEvent.call(this, name) === false)
        return;

      if (this.current != to) {

        var self = this;
        this.transition = function() { transition.call(self, from, to, arguments); self.transition = null; };

        exitState.call(this, this.current, arguments);

        if (!async)
          this.transition();
      }

      afterEvent.call(this, name, arguments);
    }

  }

  //---------------------------------------------------------------------------

};

