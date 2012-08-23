//-----------------------------------------------------------------------------

QUnit.module("basic");

//-----------------------------------------------------------------------------

test("standalone state machine", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  fsm.warn();  equal(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equal(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equal(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equal(fsm.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("targeted state machine", function() {

  StateMachine.create({
    target:  this,
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
  ]});

  equal(this.current, 'green', "initial state should be green");

  this.warn();  equal(this.current, 'yellow', "warn  event should transition from green  to yellow");
  this.panic(); equal(this.current, 'red',    "panic event should transition from yellow to red");
  this.calm();  equal(this.current, 'yellow', "calm  event should transition from red    to yellow");
  this.clear(); equal(this.current, 'green',  "clear event should transition from yellow to green");
});

//-----------------------------------------------------------------------------

test("can & cannot", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.cannot('panic'), "should NOT be able to panic from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")

  fsm.warn();
  equal(fsm.current, 'yellow', "current state should be yellow");
  ok(fsm.cannot('warn'),  "should NOT be able to warn from yellow state")
  ok(fsm.can('panic'),    "should be able to panic from yellow state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from yellow state")

  fsm.panic();
  equal(fsm.current, 'red',  "current state should be red");
  ok(fsm.cannot('warn'),  "should NOT be able to warn from red state")
  ok(fsm.cannot('panic'), "should NOT be able to panic from red state")
  ok(fsm.can('calm'),     "should be able to calm from red state")

});

//-----------------------------------------------------------------------------

test("inappropriate events", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  throws(fsm.panic.bind(fsm), /event panic inappropriate in current state green/);
  throws(fsm.calm.bind(fsm),  /event calm inappropriate in current state green/);

  fsm.warn();
  equal(fsm.current, 'yellow', "current state should be yellow");
  throws(fsm.warn.bind(fsm), /event warn inappropriate in current state yellow/);
  throws(fsm.calm.bind(fsm), /event calm inappropriate in current state yellow/);

  fsm.panic();
  equal(fsm.current, 'red', "current state should be red");
  throws(fsm.warn.bind(fsm),  /event warn inappropriate in current state red/);
  throws(fsm.panic.bind(fsm), /event panic inappropriate in current state red/);

});

//-----------------------------------------------------------------------------

test("inappropriate event handling can be customized", function() {

  var fsm = StateMachine.create({
    error: function(name, from, to, args, error, msg) { return msg; }, // return error message instead of throwing an exception
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' }
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  equal(fsm.panic(), 'event panic inappropriate in current state green');
  equal(fsm.calm(),  'event calm inappropriate in current state green');

  fsm.warn();
  equal(fsm.current, 'yellow', "current state should be yellow");
  equal(fsm.warn(), 'event warn inappropriate in current state yellow');
  equal(fsm.calm(), 'event calm inappropriate in current state yellow');
  
  fsm.panic();
  equal(fsm.current, 'red', "current state should be red");
  equal(fsm.warn(),  'event warn inappropriate in current state red');
  equal(fsm.panic(), 'event panic inappropriate in current state red');

});

//-----------------------------------------------------------------------------

test("event is cancelable", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' }
  ]});

  equal(fsm.current, 'green', 'initial state should be green');

  fsm.onbeforewarn = function() { return false; } 
  fsm.warn();

  equal(fsm.current, 'green', 'state should STAY green when event is cancelled');

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
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {

      onchangestate: function(event,from,to) { called.push('onchange from ' + from + ' to ' + to); },

      onentergreen:  function() { called.push('onentergreen');     },
      onenteryellow: function() { called.push('onenteryellow');    },
      onenterred:    function() { called.push('onenterred');       },
      onleavegreen:  function() { called.push('onleavegreen');     },
      onleaveyellow: function() { called.push('onleaveyellow');    },
      onleavered:    function() { called.push('onleavered');       },

      onbeforewarn:  function() { called.push('onbeforewarn');     },
      onbeforepanic: function() { called.push('onbeforepanic');    },
      onbeforecalm:  function() { called.push('onbeforecalm');     },
      onbeforeclear: function() { called.push('onbeforeclear');    },
      onafterwarn:   function() { called.push('onafterwarn');      },
      onafterpanic:  function() { called.push('onafterpanic');     },
      onaftercalm:   function() { called.push('onaftercalm');      },
      onafterclear:  function() { called.push('onafterclear');     },

    }
  });

  called = [];
  fsm.warn();
  deepEqual(called, ['onbeforewarn', 'onleavegreen', 'onenteryellow', 'onchange from green to yellow', 'onafterwarn']);

  called = [];
  fsm.panic();
  deepEqual(called, ['onbeforepanic', 'onleaveyellow', 'onenterred', 'onchange from yellow to red', 'onafterpanic']);

  called = [];
  fsm.calm();
  deepEqual(called, ['onbeforecalm', 'onleavered', 'onenteryellow', 'onchange from red to yellow', 'onaftercalm']);

  called = [];
  fsm.clear();
  deepEqual(called, ['onbeforeclear', 'onleaveyellow', 'onentergreen', 'onchange from yellow to green', 'onafterclear']);

});

//-----------------------------------------------------------------------------

test("callbacks are ordered correctly - for same state transition", function() {

  var called = [];

  var fsm = StateMachine.create({
    initial: 'waiting',
    events: [
      { name: 'data',    from: ['waiting', 'receipt'], to: 'receipt' },
      { name: 'nothing', from: ['waiting', 'receipt'], to: 'waiting' },
      { name: 'error',   from: ['waiting', 'receipt'], to: 'error'   } // bad practice to have event name same as state name - but I'll let it slide just this once
    ],
    callbacks: {
      onchangestate: function(event,from,to) { called.push('onchange from ' + from + ' to ' + to); },

      onenterwaiting: function() { called.push('onenterwaiting');   },
      onenterreceipt: function() { called.push('onenterreceipt');   },
      onentererror:   function() { called.push('onentererror');     },
      onleavewaiting: function() { called.push('onleavewaiting');   },
      onleavereceipt: function() { called.push('onleavereceipt');   },
      onleaveerror:   function() { called.push('onleaveerror');     },

      onbeforedata:    function() { called.push('onbeforedata');    },
      onbeforenothing: function() { called.push('onbeforenothing'); },
      onbeforeerror:   function() { called.push('onbeforeerror');   },
      onafterdata:     function() { called.push('onafterdata');     },
      onafternothing:  function() { called.push('onafternothing');  },
      onaftereerror:   function() { called.push('onaftererror');    },
    }
  });

  called = [];
  fsm.data();
  deepEqual(called, ['onbeforedata', 'onleavewaiting', 'onenterreceipt', 'onchange from waiting to receipt', 'onafterdata']);

  called = [];
  fsm.data();                                         // same-state transition
  deepEqual(called, ['onbeforedata', 'onafterdata']); // so NO enter/leave/change state callbacks are fired

  called = [];
  fsm.data();                                         // same-state transition
  deepEqual(called, ['onbeforedata', 'onafterdata']); // so NO enter/leave/change state callbacks are fired

  called = [];
  fsm.nothing();
  deepEqual(called, ['onbeforenothing', 'onleavereceipt', 'onenterwaiting', 'onchange from receipt to waiting', 'onafternothing']);

});

//-----------------------------------------------------------------------------

test("callback arguments are correct", function() {

  var expected = { event: 'startup', from: 'none', to: 'green' }; // first expected callback

  var verify_expected = function(event,from,to,a,b,c) {
    equal(event, expected.event)
    equal(from,  expected.from)
    equal(to,    expected.to)
    equal(a,     expected.a)
    equal(b,     expected.b)
    equal(c,     expected.c)
  };

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {

      onchangestate: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },

      onentergreen:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onenteryellow: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onenterred:    function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleavegreen:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleaveyellow: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleavered:    function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },

      onbeforewarn:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onbeforepanic: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onbeforecalm:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onbeforeclear: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onafterwarn:   function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onafterpanic:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onaftercalm:   function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onafterclear:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); }
    }
  });

  expected = { event: 'warn', from: 'green', to: 'yellow', a: 1, b: 2, c: 3 };
  fsm.warn(1,2,3);

  expected = { event: 'panic', from: 'yellow', to: 'red', a: 4, b: 5, c: 6 };
  fsm.panic(4,5,6);

  expected = { event: 'calm', from: 'red', to: 'yellow', a: 'foo', b: 'bar', c: null };
  fsm.calm('foo', 'bar');

  expected = { event: 'clear', from: 'yellow', to: 'green', a: null, b: null, c: null };
  fsm.clear();

});

//-----------------------------------------------------------------------------

test("exceptions in caller-provided callbacks are not swallowed (github issue #17)", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' }
    ],
    callbacks: {
      onenteryellow: function() { throw 'oops'; }
    }});

    equal(fsm.current, 'green', "initial state should be green");

    throws(fsm.warn.bind(fsm), /oops/);
});

//-----------------------------------------------------------------------------

test("no-op transitions (github issue #5)", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'noop',  from: 'green',  /* no-op */  },
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('noop'), "should be able to noop from green state")
  ok(fsm.can('warn'), "should be able to warn from green state")

  fsm.noop(); equal(fsm.current, 'green',  "noop event should not cause a transition (there is no 'to' specified)");
  fsm.warn(); equal(fsm.current, 'yellow', "warn event should transition from green to yellow");

  ok(fsm.cannot('noop'), "should NOT be able to noop from yellow state")
  ok(fsm.cannot('warn'), "should NOT be able to warn from yellow state")
  
});

//-----------------------------------------------------------------------------

test("wildcard 'from' allows event from any state (github issue #11)", function() {

  var fsm = StateMachine.create({
    initial: 'stopped',
    events: [
      { name: 'prepare', from: 'stopped',      to: 'ready'   },
      { name: 'start',   from: 'ready',        to: 'running' },
      { name: 'resume',  from: 'paused',       to: 'running' },
      { name: 'pause',   from: 'running',      to: 'paused'  },
      { name: 'stop',    from: '*',            to: 'stopped' }
  ]});

  equal(fsm.current, 'stopped', "initial state should be stopped");

  fsm.prepare(); equal(fsm.current, 'ready',   "prepare event should transition from stopped to ready");
  fsm.stop();    equal(fsm.current, 'stopped', "stop event should transition from ready to stopped");

  fsm.prepare(); equal(fsm.current, 'ready',   "prepare event should transition from stopped to ready");
  fsm.start();   equal(fsm.current, 'running', "start event should transition from ready to running");
  fsm.stop();    equal(fsm.current, 'stopped', "stop event should transition from running to stopped");

  fsm.prepare(); equal(fsm.current, 'ready',   "prepare event should transition from stopped to ready");
  fsm.start();   equal(fsm.current, 'running', "start event should transition from ready to running");
  fsm.pause();   equal(fsm.current, 'paused',  "pause event should transition from running to paused");
  fsm.stop();    equal(fsm.current, 'stopped', "stop event should transition from paused to stopped");

});

//-----------------------------------------------------------------------------

test("missing 'from' allows event from any state (github issue #11) ", function() {

  var fsm = StateMachine.create({
    initial: 'stopped',
    events: [
      { name: 'prepare', from: 'stopped',      to: 'ready'   },
      { name: 'start',   from: 'ready',        to: 'running' },
      { name: 'resume',  from: 'paused',       to: 'running' },
      { name: 'pause',   from: 'running',      to: 'paused'  },
      { name: 'stop',    /* any from state */  to: 'stopped' }
  ]});

  equal(fsm.current, 'stopped', "initial state should be stopped");

  fsm.prepare(); equal(fsm.current, 'ready',   "prepare event should transition from stopped to ready");
  fsm.stop();    equal(fsm.current, 'stopped', "stop event should transition from ready to stopped");

  fsm.prepare(); equal(fsm.current, 'ready',   "prepare event should transition from stopped to ready");
  fsm.start();   equal(fsm.current, 'running', "start event should transition from ready to running");
  fsm.stop();    equal(fsm.current, 'stopped', "stop event should transition from running to stopped");

  fsm.prepare(); equal(fsm.current, 'ready',   "prepare event should transition from stopped to ready");
  fsm.start();   equal(fsm.current, 'running', "start event should transition from ready to running");
  fsm.pause();   equal(fsm.current, 'paused',  "pause event should transition from running to paused");
  fsm.stop();    equal(fsm.current, 'stopped', "stop event should transition from paused to stopped");

});

//-----------------------------------------------------------------------------

test("event return values (github issue #12) ", function() {

  var fsm = StateMachine.create({
    initial: 'stopped',
    events: [
      { name: 'prepare', from: 'stopped', to: 'ready'   },
      { name: 'fake',    from: 'ready',   to: 'running' },
      { name: 'start',   from: 'ready',   to: 'running' }
    ],
    callbacks: {
      onbeforefake: function(event,from,to,a,b,c) { return false;              }, // this event will be cancelled
      onleaveready: function(event,from,to,a,b,c) { return StateMachine.ASYNC; } // this state transition is ASYNC
    }
  });

  equal(fsm.current, 'stopped', "initial state should be stopped");

  equal(fsm.prepare(), StateMachine.SUCCEEDED, "expected event to have SUCCEEDED");
  equal(fsm.current,   'ready',                "prepare event should transition from stopped to ready");

  equal(fsm.fake(),    StateMachine.CANCELLED, "expected event to have been CANCELLED");
  equal(fsm.current,   'ready',                "cancelled event should not cause a transition");

  equal(fsm.start(),   StateMachine.ASYNC,     "expected event to cause an ASYNC transition");
  equal(fsm.current,   'ready',                "async transition hasn't happened yet");

  equal(fsm.transition(), StateMachine.SUCCEEDED, "expected async transition to have SUCCEEDED");
  equal(fsm.current,      'running',              "async transition should now be complete");

});

