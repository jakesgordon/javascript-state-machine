import test         from 'ava';
import StateMachine from '../src/app';

//-----------------------------------------------------------------------------

test('is', t => {

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
  ]});

  t.is(fsm.state, 'green')

  t.is(fsm.is('green'),           true)
  t.is(fsm.is('yellow'),          false)
  t.is(fsm.is(['green',  'red']), true,   'current state should match when included in array')
  t.is(fsm.is(['yellow', 'red']), false,  'current state should NOT match when not included in array')

  fsm.warn()

  t.is(fsm.state, 'yellow')
  t.is(fsm.is('green'),           false)
  t.is(fsm.is('yellow'),          true)
  t.is(fsm.is(['green',  'red']), false, 'current state should NOT match when not included in array')
  t.is(fsm.is(['yellow', 'red']), true,  'current state should match when included in array')

});

//-----------------------------------------------------------------------------

test('can & cannot', t => {

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
    ]
  });

  t.is(fsm.state, 'green')
  t.is(fsm.can('warn'),     true)
  t.is(fsm.can('panic'),    false)
  t.is(fsm.can('calm'),     false)
  t.is(fsm.cannot('warn'),  false)
  t.is(fsm.cannot('panic'), true)
  t.is(fsm.cannot('calm'),  true)

  fsm.warn();
  t.is(fsm.state, 'yellow')
  t.is(fsm.can('warn'),     false)
  t.is(fsm.can('panic'),    true)
  t.is(fsm.can('calm'),     false)
  t.is(fsm.cannot('warn'),  true)
  t.is(fsm.cannot('panic'), false)
  t.is(fsm.cannot('calm'),  true)

  fsm.panic();
  t.is(fsm.state, 'red')
  t.is(fsm.can('warn'),     false)
  t.is(fsm.can('panic'),    false)
  t.is(fsm.can('calm'),     true)
  t.is(fsm.cannot('warn'),  true)
  t.is(fsm.cannot('panic'), true)
  t.is(fsm.cannot('calm'),  false)

  t.is(fsm.can('jibber'),    false, "unknown event should not crash")
  t.is(fsm.cannot('jabber'), true,  "unknown event should not crash")

});

//-----------------------------------------------------------------------------

test('can is always false during lifecycle events', t => {

  t.plan(81);

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
    ],
    methods: {
      assertTransitionsNotAllowed: function() {
        t.false(this.can('warn'))
        t.false(this.can('panic'))
        t.false(this.can('calm'))
      },
      onBeforeTransition: function() { this.assertTransitionsNotAllowed(); },
      onBeforeWarn:       function() { this.assertTransitionsNotAllowed(); },
      onBeforePanic:      function() { this.assertTransitionsNotAllowed(); },
      onBeforeCalm:       function() { this.assertTransitionsNotAllowed(); },
      onLeaveState:       function() { this.assertTransitionsNotAllowed(); },
      onLeaveNone:        function() { this.assertTransitionsNotAllowed(); },
      onLeaveGreen:       function() { this.assertTransitionsNotAllowed(); },
      onLeaveYellow:      function() { this.assertTransitionsNotAllowed(); },
      onLeaveRed:         function() { this.assertTransitionsNotAllowed(); },
      onTransition:       function() { this.assertTransitionsNotAllowed(); },
      onEnterState:       function() { this.assertTransitionsNotAllowed(); },
      onEnterNone:        function() { this.assertTransitionsNotAllowed(); },
      onEnterGreen:       function() { this.assertTransitionsNotAllowed(); },
      onEnterYellow:      function() { this.assertTransitionsNotAllowed(); },
      onEnterRed:         function() { this.assertTransitionsNotAllowed(); },
      onAfterTransition:  function() { this.assertTransitionsNotAllowed(); },
      onAfterInit:        function() { this.assertTransitionsNotAllowed(); },
      onAfterWarn:        function() { this.assertTransitionsNotAllowed(); },
      onAfterPanic:       function() { this.assertTransitionsNotAllowed(); },
      onAfterCalm:        function() { this.assertTransitionsNotAllowed(); }
    }
  });

  t.is(fsm.state, 'green')
  fsm.warn()
  t.is(fsm.state, 'yellow')
  fsm.panic()
  t.is(fsm.state, 'red')

});

//-----------------------------------------------------------------------------

test('all states', t => {

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
  ]});

  t.deepEqual(fsm.allStates(), [ 'none', 'green', 'yellow', 'red', 'done' ]);

});

//-----------------------------------------------------------------------------

test("all transitions", t => {

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
  ]});

  t.deepEqual(fsm.allTransitions(), [
    'init', 'warn', 'panic', 'calm', 'clear', 'finish'
  ]);
})

//-----------------------------------------------------------------------------

test("valid transitions", t => {

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
  ]});

  t.is(fsm.state, 'green')
  t.deepEqual(fsm.transitions(), ['warn', 'finish'])

  fsm.warn();
  t.is(fsm.state, 'yellow')
  t.deepEqual(fsm.transitions(), ['panic', 'clear'])

  fsm.panic();
  t.is(fsm.state, 'red')
  t.deepEqual(fsm.transitions(), ['calm'])

  fsm.calm();
  t.is(fsm.state, 'yellow')
  t.deepEqual(fsm.transitions(), ['panic', 'clear'])

  fsm.clear();
  t.is(fsm.state, 'green')
  t.deepEqual(fsm.transitions(), ['warn', 'finish'])

  fsm.finish();
  t.is(fsm.state, 'done')
  t.deepEqual(fsm.transitions(), [])

});

//-----------------------------------------------------------------------------
