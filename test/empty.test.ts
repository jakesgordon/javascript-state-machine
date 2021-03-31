//basics.test.ts
/// <reference types="jest" />
import StateMachine from '../src/app/app'

test('empty state machine', () => {

  const fsm = new StateMachine();

  expect(fsm.state).toBe('none');

  expect(fsm.allStates()).toEqual([ 'none' ]);
  expect(fsm.allTransitions()).toEqual([ ]);
  expect(fsm.transitions()).toEqual([ ]);

});

// Kevin: developers should be using the new keyword to instantiate a state machine
// test('empty state machine - but caller forgot new keyword', () => {
//
//   const fsm = StateMachine() // NOTE: missing 'new'
//
//   // @ts-ignore
//   expect(fsm.state).toBe('none');
//
//   // @ts-ignore
//   expect(fsm.allStates()).toEqual([ 'none' ]);
//   // @ts-ignore
//   expect(fsm.allTransitions()).toEqual([ ]);
//   // @ts-ignore
//   expect(fsm.transitions()).toEqual([ ]);
//
// })

//-------------------------------------------------------------------------------------------------

test('empty state machine - applied to existing object', () => {

  let fsm = {};

  // @ts-ignore
  fsm = StateMachine.apply(fsm);

  // @ts-ignore
  expect(fsm.state).toBe('none');

  // @ts-ignore
  expect(fsm.allStates()).toEqual([ 'none' ]);
  // @ts-ignore
  expect(fsm.allTransitions()).toEqual([ ]);
  // @ts-ignore
  expect(fsm.transitions()).toEqual([ ]);

});

//-------------------------------------------------------------------------------------------------

test('empty state machine factory', () => {

  // @ts-ignore
  const FSM = StateMachine.factory();

  // @ts-ignore
  const fsm = new FSM();

  expect(fsm.state).toBe('none');
  expect(fsm.allStates()).toEqual([ 'none' ]);
  expect(fsm.allTransitions()).toEqual([ ]);
  expect(fsm.transitions()).toEqual([ ]);
});

//-------------------------------------------------------------------------------------------------

test('empty state machine factory - applied to existing class', () => {

  // @ts-ignore
  const BaseClass = function() { this.bar = 'foo' };

  // @ts-ignore
  const FSM = StateMachine.factory(BaseClass)

  const fsm = new FSM()

  expect(fsm.state).toBe('none');

  expect(fsm.allStates()).toEqual([ 'none' ]);
  expect(fsm.allTransitions()).toEqual([ ]);
  expect(fsm.transitions()).toEqual([ ]);
});