//introspection.test.ts
/// <reference types="jest" />
import StateMachine from '../src/app/app';
import {IStateMachine} from "../dist/app/app.types";

test('is', () => {

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ],
  });

  expect(fsm.state).toBe('green');

  expect(fsm.is('green')).toBe(true);
  expect(fsm.is('yellow')).toBe(false);
  try {
    expect(fsm.is(['green', 'red'])).toBe(true);
  } catch (e) {
    throw new Error('current state should match when included in array')
  }
  try {
    expect(fsm.is(['yellow', 'red'])).toBe(false);
  } catch (e) {
    throw new Error('current state should NOT match when not included in array')
  }

  fsm.warn();

  expect(fsm.state).toBe('yellow');
  expect(fsm.is('green')).toBe(false);
  expect(fsm.is('yellow')).toBe(true);
  try {
    expect(fsm.is(['green', 'red'])).toBe(false);
  } catch (e) {
    throw new Error('current state should NOT match when not included in array')
  }
  try {
    expect(fsm.is(['yellow', 'red'])).toBe(true);
  } catch (e) {
    throw new Error('current state should match when included in array')
  }
});

test('can & cannot', () => {

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
    ]
  });

  expect(fsm.state).toBe('green');
  expect(fsm.can('warn')).toBe(true);
  expect(fsm.can('panic')).toBe(false);
  expect(fsm.can('calm')).toBe(false);
  expect(fsm.cannot('warn')).toBe(false);
  expect(fsm.cannot('panic')).toBe(true);
  expect(fsm.cannot('calm')).toBe(true);

  fsm.warn();
  expect(fsm.state).toBe('yellow');
  expect(fsm.can('warn')).toBe(false);
  expect(fsm.can('panic')).toBe(true);
  expect(fsm.can('calm')).toBe(false);
  expect(fsm.cannot('warn')).toBe(true);
  expect(fsm.cannot('panic')).toBe(false);
  expect(fsm.cannot('calm')).toBe(true);

  fsm.panic();
  expect(fsm.state).toBe('red');
  expect(fsm.can('warn')).toBe(false);
  expect(fsm.can('panic')).toBe(false);
  expect(fsm.can('calm')).toBe(true);
  expect(fsm.cannot('warn')).toBe(true);
  expect(fsm.cannot('panic')).toBe(true);
  expect(fsm.cannot('calm')).toBe(false);

  try {
    expect(fsm.can('jibber')).toBe(false);
  } catch (e) {
    throw new Error('unknown event should not crash');
  }
  try {
    expect(fsm.cannot('jabber')).toBe(true);
  } catch (e) {
    throw new Error('unknown event should not crash');
  }
});

test('can is always false during lifecycle events', () => {

  interface TestStateMachine extends IStateMachine {
    assertTransitionsNotAllowed: (this: TestStateMachine) => void;
  }

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
    ],
    methods: {
      assertTransitionsNotAllowed: function(this: TestStateMachine) {
        expect(this.can('warn')).toBe(false);
        expect(this.can('panic')).toBe(false);
        expect(this.can('calm')).toBe(false);
      },
      onBeforeTransition: function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onBeforeWarn:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onBeforePanic:      function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onBeforeCalm:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onLeaveState:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onLeaveNone:        function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onLeaveGreen:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onLeaveYellow:      function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onLeaveRed:         function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onTransition:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onEnterState:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onEnterNone:        function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onEnterGreen:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onEnterYellow:      function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onEnterRed:         function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onAfterTransition:  function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onAfterInit:        function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onAfterWarn:        function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onAfterPanic:       function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); },
      onAfterCalm:        function(this: TestStateMachine) { this.assertTransitionsNotAllowed(); }
    }
  });

  expect(fsm.state).toBe('green');
  fsm.warn()
  expect(fsm.state).toBe('yellow');
  fsm.panic()
  expect(fsm.state).toBe('red');

});

test('all states', () => {

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
    ],
  });

  expect(fsm.allStates()).toEqual([ 'none', 'green', 'yellow', 'red', 'done' ]);

});

test("all transitions", () => {

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
    ],
  });

  expect(fsm.allTransitions()).toEqual([
    'init', 'warn', 'panic', 'calm', 'clear', 'finish'
  ]);
});

test("valid transitions", () => {

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',   from: 'green',  to: 'yellow' },
      { name: 'panic',  from: 'yellow', to: 'red'    },
      { name: 'calm',   from: 'red',    to: 'yellow' },
      { name: 'clear',  from: 'yellow', to: 'green'  },
      { name: 'finish', from: 'green',  to: 'done'   },
    ]
  });

  expect(fsm.state).toBe('green');
  expect(fsm.transitions()).toEqual(['warn', 'finish']);

  fsm.warn();
  expect(fsm.state).toBe('yellow');
  expect(fsm.transitions()).toEqual(['panic', 'clear']);

  fsm.panic();
  expect(fsm.state).toBe('red');
  expect(fsm.transitions()).toEqual(['calm']);

  fsm.calm();
  expect(fsm.state).toBe('yellow');
  expect(fsm.transitions()).toEqual(['panic', 'clear']);

  fsm.clear();
  expect(fsm.state).toBe('green');
  expect(fsm.transitions()).toEqual(['warn', 'finish']);

  fsm.finish();
  expect(fsm.state).toBe('done');
  expect(fsm.transitions()).toEqual([]);

});

export {};