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
      onleavegreen:  function() { return StateMachine.ASYNC; },
      onleaveyellow: function() { return StateMachine.ASYNC; },
      onleavered:    function() { return StateMachine.ASYNC; }
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
      onleavegreen:  function() { return StateMachine.ASYNC; },
      onleaveyellow: function() { return StateMachine.ASYNC; },
      onleavered:    function() { return StateMachine.ASYNC; }
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
      onleavegreen:  function() { this.transition(); return StateMachine.ASYNC; },
      onleaveyellow: function() { this.transition(); return StateMachine.ASYNC; },
      onleavered:    function() { this.transition(); return StateMachine.ASYNC; }
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
      onleavegreen: function() { setTimeout(function() { fsm.transition(); }, 10); return StateMachine.ASYNC; },
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

test("state transition fired during onleavestate callback - but forgot to return ASYNC!", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { this.transition(); /* return StateMachine.ASYNC; */ },
      onleaveyellow: function() { this.transition(); /* return StateMachine.ASYNC; */ },
      onleavered:    function() { this.transition(); /* return StateMachine.ASYNC; */ }
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

  // but add callbacks that return ASYNC and it magically becomes asynchronous

  fsm.onleavegreen  = function() { return StateMachine.ASYNC; }
  fsm.onleaveyellow = function() { return StateMachine.ASYNC; }
  fsm.onleavered    = function() { return StateMachine.ASYNC; }

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
      return StateMachine.ASYNC;
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
      onleavegreen:  function() { return StateMachine.ASYNC; },
      onleaveyellow: function() { return StateMachine.ASYNC; },
      onleavered:    function() { return StateMachine.ASYNC; }
    }
  });

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");

  raises(fsm.calm.bind(fsm), /event calm inappropriate because previous transition did not complete/);

});

//-----------------------------------------------------------------------------

test("state transition can be cancelled (github issue #22)", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
    callbacks: {
      onleavegreen:  function() { return StateMachine.ASYNC; },
      onleaveyellow: function() { return StateMachine.ASYNC; },
      onleavered:    function() { return StateMachine.ASYNC; }
    }
  });

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");
                    equals(fsm.can('panic'), false, "but cannot panic a 2nd time because a transition is still pending")

  raises(fsm.panic.bind(fsm), /event panic inappropriate because previous transition did not complete/);

  fsm.transition.cancel();

  equals(fsm.current,     'yellow', "should still be yellow because we cancelled the async transition");
  equals(fsm.can('panic'), true,    "can now panic again because we cancelled previous async transition");

  fsm.panic();
  fsm.transition();

  equals(fsm.current, 'red', "should finally be red now that we completed the async transition");

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

      // generic callbacks
      onbeforeevent: function(event,from,to) { called.push('onbefore(' + event + ')'); },
      onafterevent:  function(event,from,to) { called.push('onafter('  + event + ')'); },
      onleavestate:  function(event,from,to) { called.push('onleave('  + from  + ')'); },
      onenterstate:  function(event,from,to) { called.push('onenter('  + to    + ')'); },
      onchangestate: function(event,from,to) { called.push('onchange(' + from + ',' + to + ')'); },

      // specific state callbacks
      onentergreen:  function() { called.push('onentergreen');                             },
      onenteryellow: function() { called.push('onenteryellow');                            },
      onenterred:    function() { called.push('onenterred');                               },
      onleavegreen:  function() { called.push('onleavegreen');  return StateMachine.ASYNC; },
      onleaveyellow: function() { called.push('onleaveyellow'); return StateMachine.ASYNC; },
      onleavered:    function() { called.push('onleavered');    return StateMachine.ASYNC; },

      // specific event callbacks
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
  fsm.warn();       deepEqual(called, ['onbeforewarn', 'onbefore(warn)', 'onleavegreen', 'onleave(green)']);
  fsm.transition(); deepEqual(called, ['onbeforewarn', 'onbefore(warn)', 'onleavegreen', 'onleave(green)', 'onenteryellow', 'onenter(yellow)', 'onchange(green,yellow)', 'onafterwarn', 'onafter(warn)']);

  called = [];
  fsm.panic();      deepEqual(called, ['onbeforepanic', 'onbefore(panic)', 'onleaveyellow', 'onleave(yellow)']);
  fsm.transition(); deepEqual(called, ['onbeforepanic', 'onbefore(panic)', 'onleaveyellow', 'onleave(yellow)', 'onenterred', 'onenter(red)', 'onchange(yellow,red)', 'onafterpanic', 'onafter(panic)']);

  called = [];
  fsm.calm();       deepEqual(called, ['onbeforecalm', 'onbefore(calm)', 'onleavered', 'onleave(red)']);
  fsm.transition(); deepEqual(called, ['onbeforecalm', 'onbefore(calm)', 'onleavered', 'onleave(red)', 'onenteryellow', 'onenter(yellow)', 'onchange(red,yellow)', 'onaftercalm', 'onafter(calm)']);

  called = [];
  fsm.clear();      deepEqual(called, ['onbeforeclear', 'onbefore(clear)', 'onleaveyellow', 'onleave(yellow)']);
  fsm.transition(); deepEqual(called, ['onbeforeclear', 'onbefore(clear)', 'onleaveyellow', 'onleave(yellow)', 'onentergreen', 'onenter(green)', 'onchange(yellow,green)', 'onafterclear', 'onafter(clear)']);

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
      onleavegreen:  function() { return StateMachine.ASYNC; },
      onleaveyellow: function() { return StateMachine.ASYNC; },
      onleavered:    function() { return StateMachine.ASYNC; }
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


