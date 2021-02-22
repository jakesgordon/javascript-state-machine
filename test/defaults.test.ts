//defaults.test.ts
/// <reference types="jest" />
import StateMachine from '../src/app/app';

const defaults = JSON.stringify(StateMachine.defaults);

describe('defaults', () => {

  afterEach(() => {
    // restore defaults
    StateMachine.defaults = JSON.parse(defaults);
  });

  test('override global initialization defaults', () => {

    StateMachine.defaults.init = {
      name: 'boot',
      from: 'booting'
    }

    const fsm = new StateMachine({
      init: 'A',
      transitions: [
        { name: 'step1', from: 'A', to: 'B' },
        { name: 'step2', from: 'B', to: 'C' }
      ]
    });

    expect(fsm.state).toBe('A');

    expect(fsm.allStates()).toEqual([ 'booting', 'A', 'B', 'C' ]);
    expect(fsm.allTransitions()).toEqual([ 'boot', 'step1', 'step2' ]);
    expect(fsm.transitions()).toEqual([ 'step1' ]);

  });
});

describe('defaults again', () => {

  beforeEach(() => {
    // restore defaults
    StateMachine.defaults = JSON.parse(defaults);
  });

  afterEach(() => {
    // restore defaults
    StateMachine.defaults = JSON.parse(defaults);
  });

  test('override global initialization defaults (again)', () => {

    StateMachine.defaults.init = {
      name: 'start',
      from: 'unknown'
    }

    const fsm = new StateMachine({
      init: 'A',
      transitions: [
        { name: 'step1', from: 'A', to: 'B' },
        { name: 'step2', from: 'B', to: 'C' }
      ]
    });


    expect(fsm.state).toBe('A');

    expect(fsm.allStates()).toEqual([ 'unknown', 'A', 'B', 'C' ]);
    expect(fsm.allTransitions()).toEqual([ 'start', 'step1', 'step2' ]);
    expect(fsm.transitions()).toEqual([ 'step1' ]);

  });

});

