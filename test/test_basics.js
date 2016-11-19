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

  equal(fsm.can('jibber'),    false, "unknown event should not crash")
  equal(fsm.cannot('jabber'), true,  "unknown event should not crash")

});

//-----------------------------------------------------------------------------

test("is", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  equal(fsm.is('green'),           true,   'current state should match');
  equal(fsm.is('yellow'),          false,  'current state should NOT match');
  equal(fsm.is(['green',  'red']), true,   'current state should match when included in array');
  equal(fsm.is(['yellow', 'red']), false,  'current state should NOT match when not included in array');

  fsm.warn();

  equal(fsm.current, 'yellow', "current state should be yellow");

  equal(fsm.is('green'),           false, 'current state should NOT match');
  equal(fsm.is('yellow'),          true,  'current state should match');
  equal(fsm.is(['green',  'red']), false, 'current state should NOT match when not included in array');
  equal(fsm.is(['yellow', 'red']), true,  'current state should match when included in array');

});

//-----------------------------------------------------------------------------

test("states", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
  ]});

  deepEqual(fsm.states(), [ 'done', 'green', 'none', 'red', 'yellow' ]);

});

//-----------------------------------------------------------------------------

test("transitions", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
  ]});

  equal(fsm.current, 'green', 'current state should be yellow');
  deepEqual(fsm.transitions(), ['warn', 'finish'], 'current transition(s) should be yellow');

  fsm.warn();
  equal(fsm.current, 'yellow', 'current state should be yellow');
  deepEqual(fsm.transitions(), ['panic', 'clear'], 'current transition(s) should be panic and clear');

  fsm.panic();
  equal(fsm.current, 'red', 'current state should be red');
  deepEqual(fsm.transitions(), ['calm'], 'current transition(s) should be calm');

  fsm.calm();
  equal(fsm.current, 'yellow', 'current state should be yellow');
  deepEqual(fsm.transitions(), ['panic', 'clear'], 'current transion(s) should be panic and clear');

  fsm.clear();
  equal(fsm.current, 'green', 'current state should be green');
  deepEqual(fsm.transitions(), ['warn', 'finish'], 'current transion(s) should be warn');

  fsm.finish();
  equal(fsm.current, 'done', 'current state should be done');
  deepEqual(fsm.transitions(), [], 'current transition(s) should be empty');

});

//-----------------------------------------------------------------------------

test("transitions with multiple from states", function() {

  var fsm = StateMachine.create({
    events: [
      { name: 'start', from: 'none',              to: 'green'  },
      { name: 'warn',  from: ['green', 'red'],    to: 'yellow' },
      { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
      { name: 'clear', from: ['red', 'yellow'],   to: 'green'  }
    ]
  });

  equal(fsm.current, 'none', 'current state should be none');
  deepEqual(fsm.transitions(), ['start'], 'current transition(s) should be start');

  fsm.start();
  equal(fsm.current, 'green', 'current state should be green');
  deepEqual(fsm.transitions(), ['warn', 'panic'], 'current transition(s) should be warn and panic');

  fsm.warn();
  equal(fsm.current, 'yellow', 'current state should be yellow');
  deepEqual(fsm.transitions(), ['panic', 'clear'], 'current transition(s) should be panic and clear');

  fsm.panic();
  equal(fsm.current, 'red', 'current state should be red');
  deepEqual(fsm.transitions(), ['warn', 'clear'], 'current transition(s) should be warn and clear');

  fsm.clear();
  equal(fsm.current, 'green', 'current state should be green');
  deepEqual(fsm.transitions(), ['warn', 'panic'], 'current transition(s) should be warn and panic');

});

//-----------------------------------------------------------------------------

test("isFinished", function() {

  var fsm = StateMachine.create({
    initial: 'green', terminal: 'red',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    }
  ]});

  equal(fsm.current,     'green');
  equal(fsm.isFinished(), false);

  fsm.warn();
  equal(fsm.current,     'yellow');
  equal(fsm.isFinished(), false);

  fsm.panic();
  equal(fsm.current,     'red');
  equal(fsm.isFinished(), true);

});

//-----------------------------------------------------------------------------

test("isFinished - without specifying terminal state", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    }
  ]});

  equal(fsm.current,     'green');
  equal(fsm.isFinished(), false);

  fsm.warn();
  equal(fsm.current,     'yellow');
  equal(fsm.isFinished(), false);

  fsm.panic();
  equal(fsm.current,     'red');
  equal(fsm.isFinished(), false);

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

      // generic callbacks
      onbeforeevent: function(event,frmo,to) { called.push('onbefore(' + event + ')'); },
      onafterevent:  function(event,frmo,to) { called.push('onafter('  + event + ')'); },
      onleavestate:  function(event,from,to) { called.push('onleave('  + from + ')'); },
      onenterstate:  function(event,from,to) { called.push('onenter('  + to   + ')'); },
      onchangestate: function(event,from,to) { called.push('onchange(' + from + ',' + to + ')'); },

      // specific state callbacks
      onentergreen:  function() { called.push('onentergreen');     },
      onenteryellow: function() { called.push('onenteryellow');    },
      onenterred:    function() { called.push('onenterred');       },
      onleavegreen:  function() { called.push('onleavegreen');     },
      onleaveyellow: function() { called.push('onleaveyellow');    },
      onleavered:    function() { called.push('onleavered');       },

      // specific event callbacks
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
  deepEqual(called, [
    'onbeforewarn',
    'onbefore(warn)',
    'onleavegreen',
    'onleave(green)',
    'onenteryellow',
    'onenter(yellow)',
    'onchange(green,yellow)',
    'onafterwarn',
    'onafter(warn)'
  ]);

  called = [];
  fsm.panic();
  deepEqual(called, [
    'onbeforepanic',
    'onbefore(panic)',
    'onleaveyellow',
    'onleave(yellow)',
    'onenterred',
    'onenter(red)',
    'onchange(yellow,red)',
    'onafterpanic',
    'onafter(panic)'
  ]);

  called = [];
  fsm.calm();
  deepEqual(called, [
    'onbeforecalm',
    'onbefore(calm)',
    'onleavered',
    'onleave(red)',
    'onenteryellow',
    'onenter(yellow)',
    'onchange(red,yellow)',
    'onaftercalm',
    'onafter(calm)'
  ]);

  called = [];
  fsm.clear();
  deepEqual(called, [
    'onbeforeclear',
    'onbefore(clear)',
    'onleaveyellow',
    'onleave(yellow)',
    'onentergreen',
    'onenter(green)',
    'onchange(yellow,green)',
    'onafterclear',
    'onafter(clear)'
  ]);

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

      // generic callbacks
      onbeforeevent: function(event,frmo,to) { called.push('onbefore(' + event + ')'); },
      onafterevent:  function(event,frmo,to) { called.push('onafter('  + event + ')'); },
      onleavestate:  function(event,from,to) { called.push('onleave('  + from + ')'); },
      onenterstate:  function(event,from,to) { called.push('onenter('  + to   + ')'); },
      onchangestate: function(event,from,to) { called.push('onchange(' + from + ',' + to + ')'); },

      // specific state callbacks
      onenterwaiting: function() { called.push('onenterwaiting');   },
      onenterreceipt: function() { called.push('onenterreceipt');   },
      onentererror:   function() { called.push('onentererror');     },
      onleavewaiting: function() { called.push('onleavewaiting');   },
      onleavereceipt: function() { called.push('onleavereceipt');   },
      onleaveerror:   function() { called.push('onleaveerror');     },

      // specific event callbacks
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
  deepEqual(called, [
    'onbeforedata',
    'onbefore(data)',
    'onleavewaiting',
    'onleave(waiting)',
    'onenterreceipt',
    'onenter(receipt)',
    'onchange(waiting,receipt)',
    'onafterdata',
    'onafter(data)'
  ]);

  called = [];
  fsm.data();           // same-state transition
  deepEqual(called, [   // so NO enter/leave/change state callbacks are fired
    'onbeforedata',
    'onbefore(data)',
    'onafterdata',
    'onafter(data)'
  ]);

  called = [];
  fsm.data();           // same-state transition
  deepEqual(called, [   // so NO enter/leave/change state callbacks are fired
    'onbeforedata',
    'onbefore(data)',
    'onafterdata',
    'onafter(data)'
  ]);

  called = [];
  fsm.nothing();
  deepEqual(called, [
    'onbeforenothing',
    'onbefore(nothing)',
    'onleavereceipt',
    'onleave(receipt)',
    'onenterwaiting',
    'onenter(waiting)',
    'onchange(receipt,waiting)',
    'onafternothing',
    'onafter(nothing)'
  ]);

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

      // generic callbacks
      onbeforeevent: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onafterevent:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleavestate:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onenterstate:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onchangestate: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },

      // specific state callbacks
      onentergreen:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onenteryellow: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onenterred:    function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleavegreen:  function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleaveyellow: function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },
      onleavered:    function(event,from,to,a,b,c) { verify_expected(event,from,to,a,b,c); },

      // specific event callbacks
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

                 deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure wildcard event (stop) is included in available transitions")
  fsm.prepare(); deepEqual(fsm.transitions(), ["start",   "stop"], "ensure wildcard event (stop) is included in available transitions")
  fsm.start();   deepEqual(fsm.transitions(), ["pause",   "stop"], "ensure wildcard event (stop) is included in available transitions")
  fsm.stop();    deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure wildcard event (stop) is included in available transitions")

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

  equal(fsm.prepare(), StateMachine.Result.SUCCEEDED, "expected event to have SUCCEEDED");
  equal(fsm.current,   'ready',                       "prepare event should transition from stopped to ready");

  equal(fsm.fake(),    StateMachine.Result.CANCELLED, "expected event to have been CANCELLED");
  equal(fsm.current,   'ready',                       "cancelled event should not cause a transition");

  equal(fsm.start(),   StateMachine.Result.PENDING,   "expected event to cause a PENDING asynchronous transition");
  equal(fsm.current,   'ready',                       "async transition hasn't happened yet");

  equal(fsm.transition(), StateMachine.Result.SUCCEEDED, "expected async transition to have SUCCEEDED");
  equal(fsm.current,      'running',                     "async transition should now be complete");

});

