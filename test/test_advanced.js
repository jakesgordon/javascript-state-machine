//-----------------------------------------------------------------------------

module("advanced");

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

  equals(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.can('panic'),    "should be able to panic from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")
  ok(fsm.cannot('clear'), "should NOT be able to clear from green state")

  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equals(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

  fsm.panic(); equals(fsm.current, 'red',   "panic event should transition from green to red");
  fsm.clear(); equals(fsm.current, 'green', "clear event should transition from red to green");
   
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

  equals(fsm.current, 'hungry');

  ok(fsm.can('eat'));
  ok(fsm.can('rest'));

  fsm.eat();
  equals(fsm.current, 'satisfied');

  fsm.eat();
  equals(fsm.current, 'full');

  fsm.eat();
  equals(fsm.current, 'sick');

  fsm.rest();
  equals(fsm.current, 'hungry');

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

  equals(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.can('panic'),    "should be able to panic from green state")
  ok(fsm.can('noop'),     "should be able to noop from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")
  ok(fsm.cannot('clear'), "should NOT be able to clear from green state")

  fsm.noop();  equals(fsm.current, 'green',  "noop  event should not transition");
  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");

  ok(fsm.cannot('warn'),  "should NOT be able to warn  from yellow state")
  ok(fsm.can('panic'),    "should     be able to panic from yellow state")
  ok(fsm.can('noop'),     "should     be able to noop  from yellow state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm  from yellow state")
  ok(fsm.can('clear'),    "should     be able to clear from yellow state")

  fsm.noop();  equals(fsm.current, 'yellow', "noop  event should not transition");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");

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

      // generic callbacks
      onbeforeevent: function(event,from,to) { called.push('onbefore(' + event + ')'); },
      onafterevent:  function(event,from,to) { called.push('onafter('  + event + ')'); },
      onleavestate:  function(event,from,to) { called.push('onleave('  + from  + ')'); },
      onenterstate:  function(event,from,to) { called.push('onenter('  + to    + ')'); },
      onchangestate: function(event,from,to) { called.push('onchange(' + from + ',' + to + ')'); },

      // specific state callbacks
      onenterhungry:    function() { called.push('onenterhungry');    },
      onleavehungry:    function() { called.push('onleavehungry');    },
      onentersatisfied: function() { called.push('onentersatisfied'); },
      onleavesatisfied: function() { called.push('onleavesatisfied'); },
      onenterfull:      function() { called.push('onenterfull');      },
      onleavefull:      function() { called.push('onleavefull');      },
      onentersick:      function() { called.push('onentersick');      },
      onleavesick:      function() { called.push('onleavesick');      },

      // specific event callbacks
      onbeforeeat:      function() { called.push('onbeforeeat');      },
      onaftereat:       function() { called.push('onaftereat');       },
      onbeforerest:     function() { called.push('onbeforerest');     },
      onafterrest:      function() { called.push('onafterrest');      }
    }
  });

  called = [];
  fsm.eat();
  deepEqual(called, [
    'onbeforeeat',
    'onbefore(eat)',
    'onleavehungry',
    'onleave(hungry)',
    'onentersatisfied',
    'onenter(satisfied)',
    'onchange(hungry,satisfied)',
    'onaftereat',
    'onafter(eat)'
  ]);

  called = [];
  fsm.eat();
  deepEqual(called, [
    'onbeforeeat',
    'onbefore(eat)',
    'onleavesatisfied',
    'onleave(satisfied)',
    'onenterfull',
    'onenter(full)',
    'onchange(satisfied,full)',
    'onaftereat',
    'onafter(eat)',
  ]);

  called = [];
  fsm.eat();
  deepEqual(called, [
    'onbeforeeat',
    'onbefore(eat)',
    'onleavefull',
    'onleave(full)',
    'onentersick',
    'onenter(sick)',
    'onchange(full,sick)',
    'onaftereat',
    'onafter(eat)'
  ]);

  called = [];
  fsm.rest();
  deepEqual(called, [
    'onbeforerest',
    'onbefore(rest)',
    'onleavesick',
    'onleave(sick)',
    'onenterhungry',
    'onenter(hungry)',
    'onchange(sick,hungry)',
    'onafterrest',
    'onafter(rest)'
  ]);

});

//-----------------------------------------------------------------------------

test("callbacks are called when appropriate for prototype based state machine", function() {

  myFSM = function() {
    this.called = [];
    this.startup();
  };

  myFSM.prototype = {

    // generic callbacks
    onbeforeevent: function(event,from,to) { this.called.push('onbefore(' + event + ')'); },
    onafterevent:  function(event,from,to) { this.called.push('onafter('  + event + ')'); },
    onleavestate:  function(event,from,to) { this.called.push('onleave('  + from  + ')'); },
    onenterstate:  function(event,from,to) { this.called.push('onenter('  + to    + ')'); },
    onchangestate: function(event,from,to) { this.called.push('onchange(' + from + ',' + to + ')'); },

    // specific state callbacks
    onenternone:    function() { this.called.push('onenternone');   },
    onleavenone:    function() { this.called.push('onleavenone');   },
    onentergreen:   function() { this.called.push('onentergreen');  },
    onleavegreen:   function() { this.called.push('onleavegreen');  },
    onenteryellow : function() { this.called.push('onenteryellow'); },
    onleaveyellow:  function() { this.called.push('onleaveyellow'); },
    onenterred:     function() { this.called.push('onenterred');    },
    onleavered:     function() { this.called.push('onleavered');    },

    // specific event callbacks
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

  deepEqual(a.called, ['onbeforestartup', 'onbefore(startup)', 'onleavenone', 'onleave(none)', 'onentergreen', 'onenter(green)', 'onchange(none,green)', 'onafterstartup', 'onafter(startup)']);
  deepEqual(b.called, ['onbeforestartup', 'onbefore(startup)', 'onleavenone', 'onleave(none)', 'onentergreen', 'onenter(green)', 'onchange(none,green)', 'onafterstartup', 'onafter(startup)']);

  a.called = [];
  b.called = [];

  a.warn();

  equal(a.current, 'yellow', 'maintain independent current state');
  equal(b.current, 'green',  'maintain independent current state');

  deepEqual(a.called, ['onbeforewarn', 'onbefore(warn)', 'onleavegreen', 'onleave(green)', 'onenteryellow', 'onenter(yellow)', 'onchange(green,yellow)', 'onafterwarn', 'onafter(warn)']);
  deepEqual(b.called, []);

});



