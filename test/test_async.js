//-----------------------------------------------------------------------------

module("async");

//-----------------------------------------------------------------------------

test("state transitions", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { return false; },
      onleaveyellow: function() { return false; },
      onleavered:    function() { return false; }
    }
  });

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();       equals(fsm.current, 'red',    "should still be red because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "calm event should transition from red to yellow");
  fsm.clear();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("state transitions with delays", function() {

  stop(); // doing async stuff - dont run next qunit test until I call start() below

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { return false; },
      onleaveyellow: function() { return false; },
      onleavered:    function() { return false; }
    }
  });

                            equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();               equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  setTimeout(function() {
    fsm.transition();       equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
    fsm.panic();            equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
    setTimeout(function() {
      fsm.transition();     equals(fsm.current, 'red',    "panic event should transition from yellow to red");
      fsm.calm();           equals(fsm.current, 'red',    "should still be red because we haven't transitioned yet");
      setTimeout(function() {
        fsm.transition();   equals(fsm.current, 'yellow', "calm event should transition from red to yellow");
        fsm.clear();        equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
        setTimeout(function() {
          fsm.transition(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");
          start();
        }, 10);
      }, 10);
    }, 10);
  }, 10);

});

//-----------------------------------------------------------------------------

test("state transition fired during onleavestate callback - immediate", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { this.transition(); return false; },
      onleaveyellow: function() { this.transition(); return false; },
      onleavered:    function() { this.transition(); return false; }
    }
  });

  equals(fsm.current, 'green', "initial state should be green");

  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equals(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("state transition fired during onleavestate callback - with delay", function() {

  stop(); // doing async stuff - dont run next qunit test until I call start() below

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'panic', from: 'green', to: 'red' }
    ],
    callbacks: {
      onleavegreen: function() { setTimeout(function() { fsm.transition(); }, 10); return false; },
      onenterred:   function() { 
        equals(fsm.current, 'red', "panic event should transition from green to red");
        start();
      }
    }
  });

               equals(fsm.current, 'green', "initial state should be green");
  fsm.panic(); equals(fsm.current, 'green', "should still be green because we haven't transitioned yet");

});

//-----------------------------------------------------------------------------

test("state transition fired during onleavestate callback - but forgot to return false!", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { this.transition(); /* return false; */ },
      onleaveyellow: function() { this.transition(); /* return false; */ },
      onleavered:    function() { this.transition(); /* return false; */ }
    }
  });

  equals(fsm.current, 'green', "initial state should be green");

  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equals(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("state transitions sometimes synchronous and sometimes asynchronous", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  // default behavior is synchronous

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();       equals(fsm.current, 'yellow', "calm event should transition from red to yellow");
  fsm.clear();      equals(fsm.current, 'green',  "clear event should transition from yellow to green");

  // but add callbacks that return false and it magically becomes asynchronous

  fsm.onleavegreen  = function() { return false; }
  fsm.onleaveyellow = function() { return false; }
  fsm.onleavered    = function() { return false; }

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();       equals(fsm.current, 'red',    "should still be red because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "calm event should transition from red to yellow");
  fsm.clear();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

  // this allows you to make on-the-fly decisions about whether async or not ...

  fsm.onleavegreen = function(event, from, to, async) {
    if (async) {
      setTimeout(function() {
        fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
        start(); // move on to next test
      }, 10);
      return false;
    }
  }
  fsm.onleaveyellow = fsm.onleavered = null;

  fsm.warn(false);  equals(fsm.current, 'yellow', "expected synchronous transition from green to yellow");
  fsm.clear();      equals(fsm.current, 'green',  "clear event should transition from yellow to green");
  fsm.warn(true);   equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");

  stop(); // doing async stuff - dont run next qunit test until I call start() in callback above

});

//-----------------------------------------------------------------------------


test("state transition fired without completing previous transition", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { return false; },
      onleaveyellow: function() { return false; },
      onleavered:    function() { return false; }
    }
  });

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");

  raises(fsm.calm.bind(fsm), /event calm inappropriate because previous transition did not complete/);

});

//-----------------------------------------------------------------------------

test("callbacks are ordered correctly", function() {

  var called = [];

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  },
    ],
    callbacks: {
      onchangestate: function(event,from,to) { called.push('onchange from ' + from + ' to ' + to); },

      onentergreen:  function() { called.push('onentergreen');                },
      onenteryellow: function() { called.push('onenteryellow');               },
      onenterred:    function() { called.push('onenterred');                  },
      onleavegreen:  function() { called.push('onleavegreen');  return false; },
      onleaveyellow: function() { called.push('onleaveyellow'); return false; },
      onleavered:    function() { called.push('onleavered');    return false; },

      onbeforewarn:  function() { called.push('onbeforewarn');                },
      onbeforepanic: function() { called.push('onbeforepanic');               },
      onbeforecalm:  function() { called.push('onbeforecalm');                },
      onbeforeclear: function() { called.push('onbeforeclear');               },
      onafterwarn:   function() { called.push('onafterwarn');                 },
      onafterpanic:  function() { called.push('onafterpanic');                },
      onaftercalm:   function() { called.push('onaftercalm');                 },
      onafterclear:  function() { called.push('onafterclear');                }
    }
  });

  called = [];
  fsm.warn();       deepEqual(called, ['onbeforewarn', 'onleavegreen']);
  fsm.transition(); deepEqual(called, ['onbeforewarn', 'onleavegreen', 'onenteryellow', 'onchange from green to yellow', 'onafterwarn']);

  called = [];
  fsm.panic();      deepEqual(called, ['onbeforepanic', 'onleaveyellow']);
  fsm.transition(); deepEqual(called, ['onbeforepanic', 'onleaveyellow', 'onenterred', 'onchange from yellow to red', 'onafterpanic']);

  called = [];
  fsm.calm();       deepEqual(called, ['onbeforecalm', 'onleavered']);
  fsm.transition(); deepEqual(called, ['onbeforecalm', 'onleavered', 'onenteryellow', 'onchange from red to yellow', 'onaftercalm']);

  called = [];
  fsm.clear();      deepEqual(called, ['onbeforeclear', 'onleaveyellow']);
  fsm.transition(); deepEqual(called, ['onbeforeclear', 'onleaveyellow', 'onentergreen', 'onchange from yellow to green', 'onafterclear']);

});

//-----------------------------------------------------------------------------

test("cannot fire event during existing transition", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { return false; },
      onleaveyellow: function() { return false; },
      onleavered:    function() { return false; }
    }
  });

  equals(fsm.current,     'green',  "initial state should be green");
  equals(fsm.can('warn'),  true,    "should be able to warn");
  equals(fsm.can('panic'), false,   "should NOT be able to panic");
  equals(fsm.can('calm'),  false,   "should NOT be able to calm");
  equals(fsm.can('clear'), false,   "should NOT be able to clear");

  fsm.warn();

  equals(fsm.current,     'green',  "should still be green because we haven't transitioned yet");
  equals(fsm.can('warn'),  false,   "should NOT be able to warn  - during transition");
  equals(fsm.can('panic'), false,   "should NOT be able to panic - during transition");
  equals(fsm.can('calm'),  false,   "should NOT be able to calm  - during transition");
  equals(fsm.can('clear'), false,   "should NOT be able to clear - during transition");

  fsm.transition();

  equals(fsm.current,     'yellow', "warn event should transition from green to yellow");
  equals(fsm.can('warn'),  false,   "should NOT be able to warn");
  equals(fsm.can('panic'), true,    "should be able to panic");
  equals(fsm.can('calm'),  false,   "should NOT be able to calm");
  equals(fsm.can('clear'), true,    "should be able to clear");

  fsm.panic();

  equals(fsm.current,     'yellow', "should still be yellow because we haven't transitioned yet");
  equals(fsm.can('warn'),  false,   "should NOT be able to warn  - during transition");
  equals(fsm.can('panic'), false,   "should NOT be able to panic - during transition");
  equals(fsm.can('calm'),  false,   "should NOT be able to calm  - during transition");
  equals(fsm.can('clear'), false,   "should NOT be able to clear - during transition");

  fsm.transition();

  equals(fsm.current,     'red',    "panic event should transition from yellow to red");
  equals(fsm.can('warn'),  false,   "should NOT be able to warn");
  equals(fsm.can('panic'), false,   "should NOT be able to panic");
  equals(fsm.can('calm'),  true,    "should be able to calm");
  equals(fsm.can('clear'), false,   "should NOT be able to clear");

});

//-----------------------------------------------------------------------------


