Demo = {

  run: function() {
    StateMachine.create({
      target: this,
      initial: 'green',
      events: [
        { name: 'warn',  from: ['green'],           to: 'yellow' },
        { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
        { name: 'calm',  from: ['red'],             to: 'yellow' },
        { name: 'clear', from: ['red',   'yellow'], to: 'green'  },
    ]});
  },

  onbeforestartup: function(event, from, to) { this.log("STARTING UP"); },
  onafterstartup:  function(event, from, to) { this.log("READY");       },

  onbeforewarn:    function(event, from, to) { this.log("START   EVENT: warn!",  true);  },
  onbeforepanic:   function(event, from, to) { this.log("START   EVENT: panic!", true);  },
  onbeforecalm:    function(event, from, to) { this.log("START   EVENT: calm!",  true);  },
  onbeforeclear:   function(event, from, to) { this.log("START   EVENT: clear!", true);  },

  onwarn:          function(event, from, to) { this.log("FINISH  EVENT: warn!");    },
  onpanic:         function(event, from, to) { this.log("FINISH  EVENT: panic!");   },
  oncalm:          function(event, from, to) { this.log("FINISH  EVENT: calm!");    },
  onclear:         function(event, from, to) { this.log("FINISH  EVENT: clear!");   },

  onleavegreen:    function(event, from, to) { this.log("LEAVE   STATE: green");  },
  onleaveyellow:   function(event, from, to) { this.log("LEAVE   STATE: yellow"); },
  onleavered:      function(event, from, to) { this.log("LEAVE   STATE: red");    this.asyncTransition(); return false; },

  ongreen:         function(event, from, to) { this.log("ENTER   STATE: green");  },
  onyellow:        function(event, from, to) { this.log("ENTER   STATE: yellow"); },
  onred:           function(event, from, to) { this.log("ENTER   STATE: red");    },

  onchangestate:   function(event, from, to) { this.log("CHANGED STATE: " + from + " to " + to); },

  asyncTransition: function() {
    var self = this;
    self.logTransition(3);
    setTimeout(function() {
      self.logTransition(2);
      setTimeout(function() {
        self.logTransition(1);
        setTimeout(function() {
          self.logTransition(0);
          self.transition();
        }, 1000);
      }, 1000);
    }, 1000);
  },

  logTransition: function(n) {
    if (n)
      this.log("PENDING STATE: " + this.transition.to + " in ..." + n);
  },

  log: function(msg, separate) {
    this.count = (this.count || 0) + (separate ? 1 : 0);

    var output = document.getElementById('output');
    output.value = this.count + ": " + msg + "\n" + (separate ? "\n" : "") + output.value;

    document.getElementById('demo').className = this.current;
    document.getElementById('panic').disabled = this.cannot('panic');
    document.getElementById('warn').disabled  = this.cannot('warn');
    document.getElementById('calm').disabled  = this.cannot('calm');
    document.getElementById('clear').disabled = this.cannot('clear');
  }

};
