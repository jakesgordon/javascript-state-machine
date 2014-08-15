//-----------------------------------------------------------------------------

QUnit.module("classes");

//-----------------------------------------------------------------------------

test("prototype based state machine", function() {

  var myFSM = function() {
    this.counter = 42;
    this.startup();
  };

  myFSM.prototype = {
    onwarn: function() { this.counter++; }
  }

  StateMachine.create({
    target: myFSM.prototype,
    events: [
      { name: 'startup', from: 'none',   to: 'green'  },
      { name: 'warn',    from: 'green',  to: 'yellow' },
      { name: 'panic',   from: 'yellow', to: 'red'    },
      { name: 'clear',   from: 'yellow', to: 'green'  }
    ]
  });

  var a = new myFSM();
  var b = new myFSM();

  equal(a.current, 'green', 'start with correct state');
  equal(b.current, 'green', 'start with correct state');

  equal(a.counter, 42, 'start with correct counter');
  equal(b.counter, 42, 'start with correct counter');

  a.warn();

  equal(a.current, 'yellow', 'maintain independent current state');
  equal(b.current, 'green',  'maintain independent current state');

  equal(a.counter, 43, 'counter for (a) should have incremented');
  equal(b.counter, 42, 'counter for (b) should remain untouched');

  ok(a.hasOwnProperty('current'), "each instance should have its own current state");
  ok(b.hasOwnProperty('current'), "each instance should have its own current state");
  ok(!a.hasOwnProperty('warn'),   "each instance should NOT have its own event methods");
  ok(!b.hasOwnProperty('warn'),   "each instance should NOT have its own event methods");
  ok(a.warn === b.warn,           "each instance should share event methods");
  ok(a.warn === a.__proto__.warn, "each instance event methods come from its shared prototype");
  ok(b.warn === b.__proto__.warn, "each instance event methods come from its shared prototype");

});

//-----------------------------------------------------------------------------

test("github issue 19", function() {

  var Foo = function() {
    this.counter = 7;
    this.initFSM();
  };

  Foo.prototype.onenterready   = function() { this.counter++; };
  Foo.prototype.onenterrunning = function() { this.counter++; };

  StateMachine.create({
    target : Foo.prototype,
    initial: { state: 'ready', event: 'initFSM', defer: true }, // unfortunately, trying to apply an IMMEDIATE initial state wont work on prototype based FSM, it MUST be deferred and called in the constructor for each instance
    events : [{name: 'execute', from: 'ready',   to: 'running'},
              {name: 'abort',   from: 'running', to: 'ready'}]
    });
 
  var foo = new Foo();
  var bar = new Foo();

  equal(foo.current, 'ready', 'start with correct state');
  equal(bar.current, 'ready', 'start with correct state');

  equal(foo.counter, 8, 'start with correct counter 7 (from constructor) + 1 (from onenterready)');
  equal(bar.counter, 8, 'start with correct counter 7 (from constructor) + 1 (from onenterready)');

  foo.execute(); // transition foo, but NOT bar

  equal(foo.current, 'running', 'changed state');
  equal(bar.current, 'ready',   'state remains the same');

  equal(foo.counter, 9, 'incremented counter during onenterrunning');
  equal(bar.counter, 8, 'counter remains the same');

});

