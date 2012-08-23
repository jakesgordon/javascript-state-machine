//-----------------------------------------------------------------------------

QUnit.module("advanced");

//-----------------------------------------------------------------------------

test("multiple 'from' states for the same event", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',             to: 'yellow' },
      { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
      { name: 'calm',  from: 'red',               to: 'yellow' },
      { name: 'clear', from: ['yellow', 'red'],   to: 'green'  },
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.can('panic'),    "should be able to panic from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")
  ok(fsm.cannot('clear'), "should NOT be able to clear from green state")

  fsm.warn();  equal(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equal(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equal(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equal(fsm.current, 'green',  "clear event should transition from yellow to green");

  fsm.panic(); equal(fsm.current, 'red',   "panic event should transition from green to red");
  fsm.clear(); equal(fsm.current, 'green', "clear event should transition from red to green");
   
});

//-----------------------------------------------------------------------------

test("multiple 'to' states for the same event", function() {

  var fsm = StateMachine.create({
    initial: 'hungry',
    events: [
      { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
      { name: 'eat',  from: 'satisfied',                             to: 'full'      },
      { name: 'eat',  from: 'full',                                  to: 'sick'      },
      { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
  ]});

  equal(fsm.current, 'hungry');

  ok(fsm.can('eat'));
  ok(fsm.can('rest'));

  fsm.eat();
  equal(fsm.current, 'satisfied');

  fsm.eat();
  equal(fsm.current, 'full');

  fsm.eat();
  equal(fsm.current, 'sick');

  fsm.rest();
  equal(fsm.current, 'hungry');

});

//-----------------------------------------------------------------------------

test("no-op transitions (github issue #5) with multiple from states", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',             to: 'yellow' },
      { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
      { name: 'noop',  from: ['green', 'yellow']               }, // NOTE: 'to' not specified
      { name: 'calm',  from: 'red',               to: 'yellow' },
      { name: 'clear', from: ['yellow', 'red'],   to: 'green'  },
  ]});

  equal(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.can('panic'),    "should be able to panic from green state")
  ok(fsm.can('noop'),     "should be able to noop from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")
  ok(fsm.cannot('clear'), "should NOT be able to clear from green state")

  fsm.noop();  equal(fsm.current, 'green',  "noop  event should not transition");
  fsm.warn();  equal(fsm.current, 'yellow', "warn  event should transition from green  to yellow");

  ok(fsm.cannot('warn'),  "should NOT be able to warn  from yellow state")
  ok(fsm.can('panic'),    "should     be able to panic from yellow state")
  ok(fsm.can('noop'),     "should     be able to noop  from yellow state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm  from yellow state")
  ok(fsm.can('clear'),    "should     be able to clear from yellow state")

  fsm.noop();  equal(fsm.current, 'yellow', "noop  event should not transition");
  fsm.panic(); equal(fsm.current, 'red',    "panic event should transition from yellow to red");

  ok(fsm.cannot('warn'),  "should NOT be able to warn  from red state")
  ok(fsm.cannot('panic'), "should NOT be able to panic from red state")
  ok(fsm.cannot('noop'),  "should NOT be able to noop  from red state")
  ok(fsm.can('calm'),     "should     be able to calm  from red state")
  ok(fsm.can('clear'),    "should     be able to clear from red state")

});

//-----------------------------------------------------------------------------

test("callbacks are called when appropriate for multiple 'from' and 'to' transitions", function() {

  var called = [];

  var fsm = StateMachine.create({
    initial: 'hungry',
    events: [
      { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
      { name: 'eat',  from: 'satisfied',                             to: 'full'      },
      { name: 'eat',  from: 'full',                                  to: 'sick'      },
      { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
    ],
    callbacks: {
      onchangestate: function(event,from,to) { called.push('onchange from ' + from + ' to ' + to); },

      onenterhungry:    function() { called.push('onenterhungry');    },
      onleavehungry:    function() { called.push('onleavehungry');    },
      onentersatisfied: function() { called.push('onentersatisfied'); },
      onleavesatisfied: function() { called.push('onleavesatisfied'); },
      onenterfull:      function() { called.push('onenterfull');      },
      onleavefull:      function() { called.push('onleavefull');      },
      onentersick:      function() { called.push('onentersick');      },
      onleavesick:      function() { called.push('onleavesick');      },

      onbeforeeat:      function() { called.push('onbeforeeat');      },
      onaftereat:       function() { called.push('onaftereat');       },
      onbeforerest:     function() { called.push('onbeforerest');     },
      onafterrest:      function() { called.push('onafterrest');      }
    }
  });

  called = [];
  fsm.eat();
  deepEqual(called, ['onbeforeeat', 'onleavehungry', 'onentersatisfied', 'onchange from hungry to satisfied', 'onaftereat']);

  called = [];
  fsm.eat();
  deepEqual(called, ['onbeforeeat', 'onleavesatisfied', 'onenterfull', 'onchange from satisfied to full', 'onaftereat']);

  called = [];
  fsm.eat();
  deepEqual(called, ['onbeforeeat', 'onleavefull', 'onentersick', 'onchange from full to sick', 'onaftereat']);

  called = [];
  fsm.rest();
  deepEqual(called, ['onbeforerest', 'onleavesick', 'onenterhungry', 'onchange from sick to hungry', 'onafterrest']);

});

//-----------------------------------------------------------------------------

test("callbacks are called when appropriate for prototype based state machine", function() {

  myFSM = function() {
    this.called = [];
    this.startup();
  };

  myFSM.prototype = {

    onchangestate: function(event,from,to) { this.called.push('onchange from ' + from + ' to ' + to); },

    onentergreen:   function() { this.called.push('onentergreen');  },
    onleavegreen:   function() { this.called.push('onleavegreen');  },
    onenteryellow : function() { this.called.push('onenteryellow'); },
    onleaveyellow:  function() { this.called.push('onleaveyellow'); },
    onenterred:     function() { this.called.push('onenterred');    },
    onleavered:     function() { this.called.push('onleavered');    },

    onbeforestartup: function() { this.called.push('onbeforestartup'); },
    onafterstartup:  function() { this.called.push('onafterstartup');  },
    onbeforewarn:    function() { this.called.push('onbeforewarn');    },
    onafterwarn:     function() { this.called.push('onafterwarn');     },
    onbeforepanic:   function() { this.called.push('onbeforepanic');   },
    onafterpanic:    function() { this.called.push('onafterpanic');    },
    onbeforeclear:   function() { this.called.push('onbeforeclear');   },
    onafterclear:    function() { this.called.push('onafterclear');    }
  };

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

  deepEqual(a.called, ['onbeforestartup', 'onentergreen', 'onchange from none to green', 'onafterstartup']);
  deepEqual(b.called, ['onbeforestartup', 'onentergreen', 'onchange from none to green', 'onafterstartup']);

  a.warn();

  equal(a.current, 'yellow', 'maintain independent current state');
  equal(b.current, 'green',  'maintain independent current state');

  deepEqual(a.called, ['onbeforestartup', 'onentergreen', 'onchange from none to green', 'onafterstartup', 'onbeforewarn', 'onleavegreen', 'onenteryellow', 'onchange from green to yellow', 'onafterwarn']);
  deepEqual(b.called, ['onbeforestartup', 'onentergreen', 'onchange from none to green', 'onafterstartup']);

});



