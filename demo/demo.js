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

  onbeforestartup: function() { this.log("STATE MACHINE IS STARTING UP"); },

  onbeforewarn:    function() { this.log("START EVENT: warn!",  true);  },
  onbeforepanic:   function() { this.log("START EVENT: panic!", true); },
  onbeforecalm:    function() { this.log("START EVENT: calm!",  true);  },
  onbeforeclear:   function() { this.log("START EVENT: clear!", true); },

  onwarn:          function() { this.log("FINISH EVENT: warn!");  },
  onpanic:         function() { this.log("FINISH EVENT: panic!"); },
  oncalm:          function() { this.log("FINISH EVENT: calm!");  },
  onclear:         function() { this.log("FINISH EVENT: clear!"); },

  onleavegreen:    function() { this.log("LEAVE STATE: green");  },
  onleaveyellow:   function() { this.log("LEAVE STATE: yellow"); },
  onleavered:      function() { this.log("LEAVE STATE: red");    },

  ongreen:         function() { this.log("ENTER STATE: green");  },
  onyellow:        function() { this.log("ENTER STATE: yellow"); },
  onred:           function() { this.log("ENTER STATE: red");    },

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
