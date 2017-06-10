import test         from 'ava';
import StateMachine from '../src/app';

//-------------------------------------------------------------------------------------------------

const defaults = JSON.stringify(StateMachine.defaults);

test.afterEach.always('restore defaults', t => {
  StateMachine.defaults = JSON.parse(defaults);
});

//-------------------------------------------------------------------------------------------------

test.serial('override global initialization defaults', t => {

  StateMachine.defaults.init = {
    name: 'boot',
    from: 'booting'
  }

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  t.is(fsm.state, 'A');

  t.deepEqual(fsm.allStates(),      [ 'booting', 'A', 'B', 'C' ]);
  t.deepEqual(fsm.allTransitions(), [ 'boot', 'step1', 'step2' ]);
  t.deepEqual(fsm.transitions(),    [ 'step1' ]);

});

//-------------------------------------------------------------------------------------------------

test.serial('override global initialization defaults (again)', t => {

  StateMachine.defaults.init = {
    name: 'start',
    from: 'unknown'
  }

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  t.is(fsm.state, 'A');

  t.deepEqual(fsm.allStates(),      [ 'unknown', 'A', 'B', 'C' ]);
  t.deepEqual(fsm.allTransitions(), [ 'start', 'step1', 'step2' ]);
  t.deepEqual(fsm.transitions(),    [ 'step1' ]);

});

//-------------------------------------------------------------------------------------------------
