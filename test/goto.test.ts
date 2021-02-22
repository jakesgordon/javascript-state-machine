//gotoTest.test.ts
/// <reference types="jest" />
import StateMachine    from '../src/app/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

function goto(state) {
  return state
}

//-------------------------------------------------------------------------------------------------

test('gotoTest transition', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B'  },
      { name: 'step', from: 'B', to: 'C'  },
      { name: 'step', from: 'C', to: 'D'  },
      { name: 'goto', from: '*', to: goto }
    ],
    methods: {
      onBeforeTransition: logger,
      onBeforeInit:       logger,
      onBeforeStep:       logger,
      onBeforeGoto:       logger,
      onLeaveState:       logger,
      onLeaveNone:        logger,
      onLeaveA:           logger,
      onLeaveB:           logger,
      onLeaveC:           logger,
      onLeaveD:           logger,
      onTransition:       logger,
      onEnterState:       logger,
      onEnterNone:        logger,
      onEnterA:           logger,
      onEnterB:           logger,
      onEnterC:           logger,
      onEnterD:           logger,
      onAfterTransition:  logger,
      onAfterInit:        logger,
      onAfterStep:        logger,
      onAfterGoto:        logger
    }
  });

  expect(fsm.state).toBe('A');
  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C', 'D' ]);
  expect(fsm.allTransitions()).toEqual([ 'init', 'step', 'goto' ]);

  logger.clear()

  fsm.goto('C')

  expect(fsm.state).toBe('C');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onBeforeGoto',       transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveState',       transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveA',           transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onTransition',       transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onEnterState',       transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onEnterC',           transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterTransition',  transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterGoto',        transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] }
  ]);
});

test('goto can have additional arguments', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B'  },
      { name: 'step', from: 'B', to: 'C'  },
      { name: 'step', from: 'C', to: 'D'  },
      { name: 'goto', from: '*', to: goto }
    ],
    methods: {
      onStep: logger,
      onGoto: logger
    }
  });

  expect(fsm.state).toBe('A');
  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C', 'D' ]);
  expect(fsm.allTransitions()).toEqual([ 'init', 'step', 'goto' ]);

  logger.clear();

  fsm.goto('C', 'with', 4, 'additional', 'arguments');

  expect(fsm.state).toBe('C');
  expect(logger.log).toEqual([
    { event: 'onGoto', transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C', 'with', 4, 'additional', 'arguments' ] }
  ]);

});

test('goto can go to an unknown state', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B'  },
      { name: 'step', from: 'B', to: 'C'  },
      { name: 'step', from: 'C', to: 'D'  },
      { name: 'goto', from: '*', to: goto }
    ],
  });

  expect(fsm.state).toBe('A');
  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C', 'D' ]);

  fsm.goto('B')
  expect(fsm.state).toBe('B');
  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C', 'D' ]);

  fsm.goto('X')
  expect(fsm.state).toBe('X');
  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C', 'D', 'X' ]);

});

test('goto can be configured with a custom name', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B'  },
      { name: 'step', from: 'B', to: 'C'  },
      { name: 'step', from: 'C', to: 'D'  },
      { name: 'jump', from: '*', to: goto }
    ],
    methods: {
      onBeforeTransition: logger,
      onBeforeInit:       logger,
      onBeforeStep:       logger,
      onBeforeJump:       logger,
      onLeaveState:       logger,
      onLeaveNone:        logger,
      onLeaveA:           logger,
      onLeaveB:           logger,
      onLeaveC:           logger,
      onLeaveD:           logger,
      onTransition:       logger,
      onEnterState:       logger,
      onEnterNone:        logger,
      onEnterA:           logger,
      onEnterB:           logger,
      onEnterC:           logger,
      onEnterD:           logger,
      onAfterTransition:  logger,
      onAfterInit:        logger,
      onAfterStep:        logger,
      onAfterJump:        logger
    }
  });

  expect(fsm.state).toBe('A');
  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C', 'D' ]);
  expect(fsm.allTransitions()).toEqual([ 'init', 'step', 'jump' ]);
  expect(fsm.goto).toBe(undefined);

  logger.clear();

  fsm.jump('C');

  expect(fsm.state).toBe('C');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onBeforeJump',       transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveState',       transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveA',           transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onTransition',       transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onEnterState',       transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onEnterC',           transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterTransition',  transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterJump',        transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] }
  ]);

});