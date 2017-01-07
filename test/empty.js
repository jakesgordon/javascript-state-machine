import test         from 'ava'
import StateMachine from '../src/app'

//-------------------------------------------------------------------------------------------------

test('empty state machine', t => {

  var fsm = new StateMachine();

  t.is(fsm.state, 'none')

  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})

//-------------------------------------------------------------------------------------------------

test('empty state machine - but caller forgot new keyword', t => {

  var fsm = StateMachine() // NOTE: missing 'new'

  t.is(fsm.state, 'none')

  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})

//-------------------------------------------------------------------------------------------------

test('empty state machine - applied to existing object', t => {

  var fsm = {};

  StateMachine.apply(fsm)

  t.is(fsm.state, 'none')

  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})

//-------------------------------------------------------------------------------------------------

test('empty state machine factory', t => {

  var FSM = StateMachine.factory(),
      fsm = new FSM();

  t.is(fsm.state, 'none')
  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})

//-------------------------------------------------------------------------------------------------

test('empty state machine factory - applied to existing class', t => {

  var FSM = function() { this._fsm() };

  StateMachine.factory(FSM)

  var fsm = new FSM()

  t.is(fsm.state, 'none')
  t.deepEqual(fsm.allStates(),      [ 'none' ])
  t.deepEqual(fsm.allTransitions(), [ ])
  t.deepEqual(fsm.transitions(),    [ ])

})

//-------------------------------------------------------------------------------------------------
