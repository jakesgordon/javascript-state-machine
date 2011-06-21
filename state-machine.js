StateMachine = {

  //---------------------------------------------------------------------------

  VERSION: "1.2.0",

  //---------------------------------------------------------------------------

  create: function(cfg) {

    var initial = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow for a simple string, or an object with { state: 'foo', event: 'setup', defer: true|false }
    var fsm     = cfg.target  || {};
    var events  = {};

    var add = function(e) {
      var from = (e.from instanceof Array) ? e.from : [e.from];
      events[e.name] = events[e.name] || {};
      for (var n = 0 ; n < from.length ; n++)
        events[e.name][from[n]] = e.to;
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

    return function() {

      if (this.cannot(name))
        throw "event " + name + " innapropriate in current state " + this.current;

      var from = this.current;
      var to   = map[from];

      var beforeEvent = this['onbefore' + name];
      if (beforeEvent && (false === beforeEvent.apply(this, arguments)))
        return;

      if (this.current != to) {

        var exitState = this['onleave'  + this.current];
        if (exitState)
          exitState.apply(this, arguments);

        this.current = to;

        var enterState = this['onenter' + to] || this['on' + to];
        if (enterState)
          enterState.apply(this, arguments);
      }

      var afterEvent = this['onafter'  + name] || this['on' + name];
      if (afterEvent)
        afterEvent.apply(this, arguments);
    }

  }

  //---------------------------------------------------------------------------

};

