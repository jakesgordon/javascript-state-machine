StateMachine = {

  //---------------------------------------------------------------------------

  create: function(cfg) {

    var target  = cfg.target || {};
    var initial = cfg.state;
    var events  = cfg.events;

    var can = {
      startup: ['none'] // implicit 'startup' event is allowed from implicit 'none' state
    }

    var n, event, name;
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

    this.buildEvent('startup', 'none', initial, target).call(target); // call an implicit 'startup' event to set the initial state

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

      var exitState = this['onleave'  + this.current];
      if (exitState)
        exitState.apply(this, arguments);

      this.current = to;

      var enterState = this['onenter' + to] || this['on' + to];
      if (enterState)
        enterState.apply(this, arguments);

      var afterEvent = this['onafter'  + name] || this['on' + name];
      if (afterEvent)
        afterEvent.apply(this, arguments);
    }

  }

  //---------------------------------------------------------------------------

};

