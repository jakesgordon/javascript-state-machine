//construction.test.ts
/// <reference types="jest" />
import StateMachine from '../src/app/app'
import {IStateMachine} from "../dist/app/app.types";

test('singleton construction', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'init',  from: 'none', to: 'A' },
      { name: 'step1', from: 'A',    to: 'B' },
      { name: 'step2', from: 'B',    to: 'C' }
    ]
  });

  expect(fsm.state).toBe('none');

  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C' ])
  expect(fsm.allTransitions()).toEqual([ 'init', 'step1', 'step2' ])
  expect(fsm.transitions()).toEqual([ 'init' ])
});

test('singleton construction - with init state', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  expect(fsm.state).toBe('A');

  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);
  expect(fsm.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);
  expect(fsm.transitions()).toEqual([ 'step1' ]);

});

test('singleton construction - with init state and transition', () => {

  const fsm = new StateMachine({
    init: { name: 'boot', to: 'A' },
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  expect(fsm.state).toBe('A');

  expect(fsm.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);
  expect(fsm.allTransitions()).toEqual([ 'boot', 'step1', 'step2' ]);
  expect(fsm.transitions()).toEqual([ 'step1' ]);

});

test('singleton construction - with init state, transition, AND from state', () => {

  const fsm = new StateMachine({
    init: { name: 'boot', from: 'booting', to: 'A' },
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

test('singleton construction - with custom data and methods', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ],
    data: {
      value: 42
    },
    methods: {
      talk: function() {
        // @ts-ignore
        return this.state + ' - ' + this.value
      }
    }
  });

  expect(fsm.state).toBe('A');
  expect(fsm.value).toBe(42);
  expect(fsm.talk()).toBe('A - 42');

  fsm.step1()

  expect(fsm.state).toBe('B');
  expect(fsm.value).toBe(42);
  expect(fsm.talk()).toBe('B - 42');

  fsm.value = 99

  expect(fsm.state).toBe('B');
  expect(fsm.value).toBe(99);
  expect(fsm.talk()).toBe('B - 99');

});

test('factory construction', () => {

  const MyClass = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  const fsm1 = new MyClass(),
    fsm2 = new MyClass(),
    fsm3 = new MyClass();

  fsm2.step1()
  fsm3.step1()
  fsm3.step2()

  expect(fsm1.state).toBe('A');
  expect(fsm2.state).toBe('B');
  expect(fsm3.state).toBe('C');

  expect(fsm1.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);
  expect(fsm2.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);
  expect(fsm3.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);

  expect(fsm1.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);
  expect(fsm2.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);
  expect(fsm3.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);

  expect(fsm1.transitions()).toEqual([ 'step1' ]);
  expect(fsm2.transitions()).toEqual([ 'step2' ]);
  expect(fsm3.transitions()).toEqual([         ]);

  expect(fsm1.allStates).toEqual(MyClass.prototype.allStates);
  expect(fsm2.allStates).toEqual(MyClass.prototype.allStates);
  expect(fsm3.allStates).toEqual(MyClass.prototype.allStates);
});

test('factory construction - with custom data and methods', () => {

  const MyClass = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ],
    data: function(value) {
      return {
        value: value
      }
    },
    methods: {
      talk: function(this: IStateMachine) {
        return this.state + ' - ' + this.value
      }
    }
  });

  const fsm1 = new MyClass(1),
    fsm2 = new MyClass(2),
    fsm3 = new MyClass(3);

  expect(fsm1.state).toBe('A');
  expect(fsm2.state).toBe('A');
  expect(fsm3.state).toBe('A');

  expect(fsm1.talk()).toBe('A - 1');
  expect(fsm2.talk()).toBe('A - 2');
  expect(fsm3.talk()).toBe('A - 3');

  fsm2.step1()
  fsm3.step1()
  fsm3.step2()

  expect(fsm1.state).toBe('A');
  expect(fsm2.state).toBe('B');
  expect(fsm3.state).toBe('C');

  expect(fsm1.talk()).toBe('A - 1');
  expect(fsm2.talk()).toBe('B - 2');
  expect(fsm3.talk()).toBe('C - 3');

  expect(fsm1.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);
  expect(fsm2.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);
  expect(fsm3.allStates()).toEqual([ 'none', 'A', 'B', 'C' ]);

  expect(fsm1.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);
  expect(fsm2.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);
  expect(fsm3.allTransitions()).toEqual([ 'init', 'step1', 'step2' ]);

  expect(fsm1.transitions()).toEqual([ 'step1' ]);
  expect(fsm2.transitions()).toEqual([ 'step2' ]);
  expect(fsm3.transitions()).toEqual([         ]);

  expect(fsm1.allStates).toEqual(MyClass.prototype.allStates);
  expect(fsm2.allStates).toEqual(MyClass.prototype.allStates);
  expect(fsm3.allStates).toEqual(MyClass.prototype.allStates);
});

export {};