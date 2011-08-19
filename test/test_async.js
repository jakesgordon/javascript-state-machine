//-----------------------------------------------------------------------------

module("async");

//-----------------------------------------------------------------------------

test("state transitions", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow', async: true },
      { name: 'panic', from: 'yellow', to: 'red',    async: true },
      { name: 'calm',  from: 'red',    to: 'yellow', async: true },
      { name: 'clear', from: 'yellow', to: 'green',  async: true }
  ]});

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
      { name: 'warn',  from: 'green',  to: 'yellow', async: true },
      { name: 'panic', from: 'yellow', to: 'red',    async: true },
      { name: 'calm',  from: 'red',    to: 'yellow', async: true },
      { name: 'clear', from: 'yellow', to: 'green',  async: true }
  ]});

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

test("state transition fired imediately during onleavestate hook", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow', async: true },
      { name: 'panic', from: 'yellow', to: 'red',    async: true },
      { name: 'calm',  from: 'red',    to: 'yellow', async: true },
      { name: 'clear', from: 'yellow', to: 'green',  async: true }
  ]});

  fsm.onleavegreen  = function() { this.transition(); }
  fsm.onleaveyellow = function() { this.transition(); }
  fsm.onleavered    = function() { this.transition(); }

  equals(fsm.current, 'green', "initial state should be green");

  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equals(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("state transition fired during onleavestate hook with delay", function() {

  stop(); // doing async stuff - dont run next qunit test until I call start() below

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'panic', from: 'green', to: 'red', async: true }
  ]});

  fsm.onleavegreen = function() { setTimeout(function() { fsm.transition(); }, 10); }
  fsm.onenterred   = function() { 
    equals(fsm.current, 'red', "panic event should transition from green to red");
    start();
  }

               equals(fsm.current, 'green', "initial state should be green");
  fsm.panic(); equals(fsm.current, 'green', "should still be green because we haven't transitioned yet");

});

//-----------------------------------------------------------------------------

test("state transition fired during onleavestate hook - with MIXED async and non-async transitions!", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',   from: 'green',           to: 'yellow', async: true }, // leave green     async
      { name: 'panic',  from: 'green',           to: 'red'                 }, // leave green non-async
      { name: 'reset',  from: ['yellow', 'red'], to: 'green'               }
  ]});

  fsm.onleavegreen  = function() { this.transition(); }

               equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.reset(); equals(fsm.current, 'green',  "reset event should transition from yellow to green");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from green  to red");

});

//-----------------------------------------------------------------------------

test("state transition fired without completing previous transition", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',  to: 'yellow', async: true },
      { name: 'panic', from: 'yellow', to: 'red',    async: true },
      { name: 'calm',  from: 'red',    to: 'yellow', async: true },
      { name: 'clear', from: 'yellow', to: 'green',  async: true }
  ]});

                    equals(fsm.current, 'green',  "initial state should be green");
  fsm.warn();       equals(fsm.current, 'green',  "should still be green because we haven't transitioned yet");
  fsm.transition(); equals(fsm.current, 'yellow', "warn event should transition from green to yellow");
  fsm.panic();      equals(fsm.current, 'yellow', "should still be yellow because we haven't transitioned yet");

  raises(fsm.calm.bind(fsm), /event calm innapropriate because previous async transition from yellow to red did not complete/);

});

//-----------------------------------------------------------------------------

