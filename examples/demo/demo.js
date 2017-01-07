Demo = function() {

  var output = document.getElementById('output'),
      demo   = document.getElementById('demo'),
      panic  = document.getElementById('panic'),
      warn   = document.getElementById('warn'),
      calm   = document.getElementById('calm'),
      clear  = document.getElementById('clear'),
      count  = 0;

  var log = function(msg, separate) {
    count = count + (separate ? 1 : 0);
    output.value = count + ": " + msg + "\n" + (separate ? "\n" : "") + output.value;
    refreshUI();
  };

  var refreshUI = function() {
    setTimeout(function() {
      demo.className = fsm.state;
      panic.disabled = fsm.cannot('panic', true);
      warn.disabled  = fsm.cannot('warn',  true);
      calm.disabled  = fsm.cannot('calm',  true);
      clear.disabled = fsm.cannot('clear', true);
    }, 0); // defer until end of current tick to allow fsm to complete transaction
  };

  var fsm = new StateMachine({

    transitions: [
      { name: 'start', from: 'none',   to: 'green'  },
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'green',  to: 'red'    },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'red',    to: 'green'  },
      { name: 'clear', from: 'yellow', to: 'green'  },
    ],

    methods: {

      onBeforeTransition: function(lifecycle) {
        log("BEFORE: " + lifecycle.transition, true);
      },

      onLeaveState: function(lifecycle) {
        log("LEAVE: " + lifecycle.from);
      },

      onEnterState: function(lifecycle) {
        log("ENTER: " + lifecycle.to);
      },

      onAfterTransition: function(lifecycle) {
        log("AFTER: " + lifecycle.transition);
      },

      onTransition: function(lifecycle) {
        log("DURING: " + lifecycle.transition + " (from " + lifecycle.from + " to " + lifecycle.to + ")");
      },

      onLeaveRed: function(lifecycle) {
        return new Promise(function(resolve, reject) {
          var msg = lifecycle.transition + ' to ' + lifecycle.to;
          log("PENDING " + msg + " in ...3");
          setTimeout(function() {
            log("PENDING " + msg + " in ...2");
            setTimeout(function() {
              log("PENDING " + msg + " in ...1");
              setTimeout(function() {
                resolve();
              }, 1000);
            }, 1000);
          }, 1000);
        });
      }

    }
  });

  fsm.start();
  return fsm;

}();

