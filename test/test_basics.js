//-----------------------------------------------------------------------------

module("basic");

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

  equals(fsm.current, 'green', "initial state should be green");

  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equals(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("targetted state machine", function() {

  StateMachine.create({
    target:  this,
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
  ]});

  equals(this.current, 'green', "initial state should be green");

  this.warn();  equals(this.current, 'yellow', "warn  event should transition from green  to yellow");
  this.panic(); equals(this.current, 'red',    "panic event should transition from yellow to red");
  this.calm();  equals(this.current, 'yellow', "calm  event should transition from red    to yellow");
  this.clear(); equals(this.current, 'green',  "clear event should transition from yellow to green");
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

  equals(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.cannot('panic'), "should NOT be able to panic from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")

  fsm.warn();
  equals(fsm.current, 'yellow', "current state should be yellow");
  ok(fsm.cannot('warn'),  "should NOT be able to warn from yellow state")
  ok(fsm.can('panic'),    "should be able to panic from yellow state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from yellow state")

  fsm.panic();
  equals(fsm.current, 'red',  "current state should be red");
  ok(fsm.cannot('warn'),  "should NOT be able to warn from red state")
  ok(fsm.cannot('panic'), "should NOT be able to panic from red state")
  ok(fsm.can('calm'),     "should be able to calm from red state")

});

//-----------------------------------------------------------------------------

test("innapropriate events", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
  ]});

  equals(fsm.current, 'green', "initial state should be green");

  raises(fsm.panic.bind(fsm), /event panic innapropriate in current state green/);
  raises(fsm.calm.bind(fsm),  /event calm innapropriate in current state green/);

  fsm.warn();
  equals(fsm.current, 'yellow', "current state should be yellow");
  raises(fsm.warn.bind(fsm), /event warn innapropriate in current state yellow/);
  raises(fsm.calm.bind(fsm), /event calm innapropriate in current state yellow/);

  fsm.panic();
  equals(fsm.current, 'red', "current state should be red");
  raises(fsm.warn.bind(fsm),  /event warn innapropriate in current state red/);
  raises(fsm.panic.bind(fsm), /event panic innapropriate in current state red/);

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

test("hooks are called when appropriate", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  },
  ]});

  var called = [];

  // state hooks
  fsm.onentergreen    = function() { called.push('onentergreen');     };
  fsm.onleavegreen    = function() { called.push('onleavegreen');     };
  fsm.onenteryellow   = function() { called.push('onenteryellow');    };
  fsm.onleaveyellow   = function() { called.push('onleaveyellow');    };
  fsm.onenterred      = function() { called.push('onenterred');       };
  fsm.onleavered      = function() { called.push('onleavered');       };

  // event hooks
  fsm.onbeforewarn    = function() { called.push('onbeforewarn');     };
  fsm.onafterwarn     = function() { called.push('onafterwarn');      };
  fsm.onbeforepanic   = function() { called.push('onbeforepanic');    };
  fsm.onafterpanic    = function() { called.push('onafterpanic');     };
  fsm.onbeforecalm    = function() { called.push('onbeforecalm');     };
  fsm.onaftercalm     = function() { called.push('onaftercalm');      };
  fsm.onbeforeclear   = function() { called.push('onbeforeclear');    };
  fsm.onafterclear    = function() { called.push('onafterclear');     }

  called = [];
  fsm.warn();
  deepEqual(called, ['onbeforewarn', 'onleavegreen', 'onenteryellow', 'onafterwarn']);

  called = [];
  fsm.panic();
  deepEqual(called, ['onbeforepanic', 'onleaveyellow', 'onenterred', 'onafterpanic']);

  called = [];
  fsm.calm();
  deepEqual(called, ['onbeforecalm', 'onleavered', 'onenteryellow', 'onaftercalm']);

  called = [];
  fsm.clear();
  deepEqual(called, ['onbeforeclear', 'onleaveyellow', 'onentergreen', 'onafterclear']);

});

//-----------------------------------------------------------------------------


