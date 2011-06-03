StateMachine = {

  //---------------------------------------------------------------------------

  create: function(cfg) {

    var target  = cfg.target  || {};
    var events  = cfg.events;

    var n, event, name, can = {};
    for(n = 0 ; n < events.length ; n++) {
      event = events[n];
      name  = event.name;
      can[name] = (can[name] || []).concat(event.from);
      target[name] = this.buildEvent(name, event.from, event.to, target);
    }

    target.current = 'none';
    target.is      = function(state) { return this.current == state; };
    target.can     = function(event) { return can[event].indexOf(this.current) >= 0; };
    target.cannot  = function(event) { return !this.can(event); };

    if (cfg.initial) { // see "initial" qunit tests for examples
      var initial = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow single string to represent initial state, or complex object to configure { state: 'first', event: 'init', defer: true|false }
      name = initial.event || 'startup';
      can[name] = ['none'];
      event = this.buildEvent(name, 'none', initial.state, target);
      if (initial.defer)
        target[name] = event; // allow caller to trigger initial transition event
      else
        event.call(target);
    }

    return target;
  },

  //---------------------------------------------------------------------------

  buildEvent: function(name, from, to, target) {

    return function() {

      if (this.cannot(name))
        throw "event " + name + " innapropriate in current state " + this.current;

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

