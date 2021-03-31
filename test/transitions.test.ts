//transitions.test.ts
/// <reference types="jest" />
import StateMachine    from '../src/app/app'
import LifecycleLogger from './helpers/lifecycle_logger'

test('basic transition from state to state', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' },
      { name: 'step3', from: 'C', to: 'D' }
    ]
  });

  expect(fsm.state).toBe('A');

  fsm.step1(); expect(fsm.state).toBe('B');
  fsm.step2(); expect(fsm.state).toBe('C');
  fsm.step3(); expect(fsm.state).toBe('D');

});

//-----------------------------------------------------------------------------

test('multiple transitions with same name', () => {

  const fsm = new StateMachine({
    init: 'hungry',
    transitions: [
      { name: 'eat',  from: 'hungry',    to: 'satisfied' },
      { name: 'eat',  from: 'satisfied', to: 'full'      },
      { name: 'eat',  from: 'full',      to: 'sick'      },
      { name: 'rest', from: '*',         to: 'hungry'    }
    ]
  });

  expect(fsm.state).toBe('hungry');
  expect(fsm.can('eat')).toBe(true);
  expect(fsm.can('rest')).toBe(true);

  fsm.eat();

  expect(fsm.state).toBe('satisfied');
  expect(fsm.can('eat')).toBe(true);
  expect(fsm.can('rest')).toBe(true);

  fsm.eat();

  expect(fsm.state).toBe('full');
  expect(fsm.can('eat')).toBe(true);
  expect(fsm.can('rest')).toBe(true);

  fsm.eat();

  expect(fsm.state).toBe('sick');
  expect(fsm.can('eat')).toBe(false);
  expect(fsm.can('rest')).toBe(true);

  fsm.rest();

  expect(fsm.state).toBe('hungry');
  expect(fsm.can('eat')).toBe(true);
  expect(fsm.can('rest')).toBe(true);

});

test('transitions with multiple from states', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'start', from: 'none',              to: 'green'  },
      { name: 'warn',  from: ['green', 'red'],    to: 'yellow' },
      { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
      { name: 'clear', from: ['red', 'yellow'],   to: 'green'  },
    ],
  });

  expect(fsm.allStates()).toEqual([ 'none', 'green', 'yellow', 'red'  ]);
  expect(fsm.allTransitions()).toEqual([ 'start', 'warn', 'panic', 'clear' ]);

  expect(fsm.state).toBe('none');
  expect(fsm.can('start')).toBe(true);
  expect(fsm.can('warn')).toBe(false);
  expect(fsm.can('panic')).toBe(false);
  expect(fsm.can('clear')).toBe(false);
  expect(fsm.transitions()).toEqual(['start']);

  fsm.start();
  expect(fsm.state).toBe('green');
  expect(fsm.can('start')).toBe(false);
  expect(fsm.can('warn')).toBe(true);
  expect(fsm.can('panic')).toBe(true);
  expect(fsm.can('clear')).toBe(false);
  expect(fsm.transitions()).toEqual(['warn', 'panic']);

  fsm.warn();
  expect(fsm.state).toBe('yellow');
  expect(fsm.can('start')).toBe(false);
  expect(fsm.can('warn')).toBe(false);
  expect(fsm.can('panic')).toBe(true);
  expect(fsm.can('clear')).toBe(true);
  expect(fsm.transitions()).toEqual(['panic', 'clear']);

  fsm.panic();
  expect(fsm.state).toBe('red');
  expect(fsm.can('start')).toBe(false);
  expect(fsm.can('warn')).toBe(true);
  expect(fsm.can('panic')).toBe(false);
  expect(fsm.can('clear')).toBe(true);
  expect(fsm.transitions()).toEqual(['warn', 'clear']);

  fsm.clear();
  expect(fsm.state).toBe('green');
  expect(fsm.can('start')).toBe(false);
  expect(fsm.can('warn')).toBe(true);
  expect(fsm.can('panic')).toBe(true);
  expect(fsm.can('clear')).toBe(false);
  expect(fsm.transitions()).toEqual(['warn', 'panic']);

});

test("transitions that dont change state, dont trigger enter/leave lifecycle events", () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    transitions: [
      { name: 'noop', from: 'none', to: 'none' }
    ],
    methods: {
      onBeforeTransition: logger,
      onBeforeNoop:       logger,
      onLeaveState:       logger,
      onLeaveNone:        logger,
      onTransition:       logger,
      onEnterState:       logger,
      onEnterNone:        logger,
      onNone:             logger,
      onAfterTransition:  logger,
      onAfterNoop:        logger,
      onNoop:             logger
    }
  });

  expect(fsm.state).toBe('none');
  expect(logger.log).toEqual([]);

  fsm.noop();

  expect(fsm.state).toBe('none');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onBeforeNoop',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onTransition',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterTransition',  transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterNoop',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onNoop',             transition: 'noop', from: 'none', to: 'none', current: 'none' }
  ]);

});

test("transitions that dont change state, can be configured to trigger enter/leave lifecycle events", () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    observeUnchangedState: true,
    transitions: [
      { name: 'noop', from: 'none', to: 'none' }
    ],
    methods: {
      onBeforeTransition: logger,
      onBeforeNoop:       logger,
      onLeaveState:       logger,
      onLeaveNone:        logger,
      onTransition:       logger,
      onEnterState:       logger,
      onEnterNone:        logger,
      onNone:             logger,
      onAfterTransition:  logger,
      onAfterNoop:        logger,
      onNoop:             logger
    }
  });

  expect(fsm.state).toBe('none');
  expect(logger.log).toEqual([]);

  fsm.noop();

  expect(fsm.state).toBe('none');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onBeforeNoop',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onLeaveState',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onLeaveNone',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onTransition',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onEnterState',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onEnterNone',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onNone',             transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterTransition',  transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterNoop',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onNoop',             transition: 'noop', from: 'none', to: 'none', current: 'none' }
  ]);

});

test("transition methods with dash or underscore are camelized", () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'do-with-dash',       from: 'A', to: 'B' },
      { name: 'do_with_underscore', from: 'B', to: 'C' },
      { name: 'doAlreadyCamelized', from: 'C', to: 'D' }
    ]
  });

  expect(fsm.state).toBe('A');
  fsm.doWithDash();         expect(fsm.state).toBe('B');
  fsm.doWithUnderscore();   expect(fsm.state).toBe('C');
  fsm.doAlreadyCamelized(); expect(fsm.state).toBe('D');

});

test('conditional transitions',  () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      // @ts-ignore
      { name: 'step', from: '*', to: function(n) { return this.skip(n); } },
    ],
    methods: {
      skip: function(amount) {
        // @ts-ignore
        const code = this.state.charCodeAt(0);
        return String.fromCharCode(code + (amount || 1));
      },
      onBeforeTransition: logger,
      onBeforeInit:       logger,
      onBeforeStep:       logger,
      onLeaveState:       logger,
      onLeaveNone:        logger,
      onLeaveA:           logger,
      onLeaveB:           logger,
      onLeaveG:           logger,
      onTransition:       logger,
      onEnterState:       logger,
      onEnterNone:        logger,
      onEnterA:           logger,
      onEnterB:           logger,
      onEnterG:           logger,
      onAfterTransition:  logger,
      onAfterInit:        logger,
      onAfterStep:        logger
    }
  });

  expect(fsm.state).toBe('A');

  expect(fsm.allStates()).toEqual([ 'none', 'A' ]);

  fsm.step();  expect(fsm.state).toBe('B'); expect(fsm.allStates()).toEqual([ 'none', 'A', 'B' ]);
  fsm.step(5); expect(fsm.state).toBe('G'); expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'G' ]);

  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onEnterA',           transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'A', current: 'A'              },

    { event: 'onBeforeTransition', transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onBeforeStep',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onLeaveState',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onLeaveA',           transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onTransition',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onEnterState',       transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onEnterB',           transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onAfterTransition',  transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onAfterStep',        transition: 'step', from: 'A',    to: 'B', current: 'B'              },

    { event: 'onBeforeTransition', transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onLeaveState',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onLeaveB',           transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onTransition',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onEnterState',       transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onEnterG',           transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onAfterStep',        transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
  ]);

});

test('async conditional transitions',  async () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      // @ts-ignore
      {
        name: 'step',
        from: '*',
        to: async function(n) {
          // @ts-ignore
          return await this.skip(n);
        }
      },
    ],
    methods: {
      skip: function(amount) {
        // @ts-ignore
        const code = this.state.charCodeAt(0);
        return String.fromCharCode(code + (amount || 1));
      },
      onBeforeTransition: logger,
      onBeforeInit:       logger,
      onBeforeStep:       logger,
      onLeaveState:       logger,
      onLeaveNone:        logger,
      onLeaveA:           logger,
      onLeaveB:           logger,
      onLeaveG:           logger,
      onTransition:       logger,
      onEnterState:       logger,
      onEnterNone:        logger,
      onEnterA:           logger,
      onEnterB:           logger,
      onEnterG:           logger,
      onAfterTransition:  logger,
      onAfterInit:        logger,
      onAfterStep:        logger
    }
  });

  expect(fsm.state).toBe('A');

  expect(fsm.allStates()).toEqual([ 'none', 'A' ]);

  await fsm.step();  expect(fsm.state).toBe('B'); expect(fsm.allStates()).toEqual([ 'none', 'A', 'B' ]);
  await fsm.step(5); expect(fsm.state).toBe('G'); expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'G' ]);

  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onEnterA',           transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'A', current: 'A'              },

    { event: 'onBeforeTransition', transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onBeforeStep',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onLeaveState',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onLeaveA',           transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onTransition',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onEnterState',       transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onEnterB',           transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onAfterTransition',  transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onAfterStep',        transition: 'step', from: 'A',    to: 'B', current: 'B'              },

    { event: 'onBeforeTransition', transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onLeaveState',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onLeaveB',           transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onTransition',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onEnterState',       transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onEnterG',           transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onAfterStep',        transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
  ]);

});

export {}