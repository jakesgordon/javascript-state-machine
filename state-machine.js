StateMachine = {

  //---------------------------------------------------------------------------

  create: function(cfg) {

    var target  = cfg.target  || {};
    var events  = cfg.events;
    var initial = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial;
    var map     = {};
    var n;

    var addMap = function(map, event) {
      var from = (event.from instanceof Array) ? event.from : [event.from];
      map[event.name] = map[event.name] || {};
      for (var n = 0 ; n < from.length ; n++)
        map[event.name][from[n]] = event.to;
    }

    if (initial) {
      initial.event = initial.event || 'startup';
      addMap(map, { name: initial.event, from: 'none', to: initial.state });
    }

    for(n = 0 ; n < events.length ; n++)
      addMap(map, events[n]);

    for(n in map) {
      if (map.hasOwnProperty(n))
        target[n] = this.buildEvent(n, map[n], target);
    }

    target.current = 'none';
    target.is      = function(state) { return this.current == state; };
    target.can     = function(event) { return map[event][this.current]; };
    target.cannot  = function(event) { return !this.can(event); };

    if (initial && !initial.defer)
      target[initial.event]();

    return target;
  },

  //---------------------------------------------------------------------------

  buildEvent: function(name, map, target) {

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

