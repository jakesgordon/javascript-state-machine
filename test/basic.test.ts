//basics.test.ts
/// <reference types="jest" />
import StateMachine from '../src/app/app';

test('version', () => {
  expect(StateMachine.version).toBe('3.0.1');
});

test('state machine', () => {

  const fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  expect(fsm.state).toBe('green');
  fsm.warn();
  expect(fsm.state).toBe('yellow');
  fsm.panic();
  expect(fsm.state).toBe('red');
  fsm.calm();
  expect(fsm.state).toBe('yellow');
  fsm.clear();
  expect(fsm.state).toBe('green');
});

test('state machine - applied to existing object', () => {

  let obj = { name: 'alarm' }

  // @ts-ignore
  obj = StateMachine.apply(obj, {
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  expect(obj.name).toBe('alarm');
  // @ts-ignore
  expect(obj.state).toBe('green');
  // @ts-ignore
  obj.warn(); expect(obj.state).toBe('yellow');
  // @ts-ignore
  obj.panic(); expect(obj.state).toBe('red');
  // @ts-ignore
  obj.calm(); expect(obj.state).toBe('yellow');
  // @ts-ignore
  obj.clear(); expect(obj.state).toBe('green');
});

test('state machine factory - applied to existing class', () => {

  function Alarm(name) {
    // @ts-ignore
    this.name = name
  }

  const AlarmFSM = StateMachine.factory(Alarm, {
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  const a = new AlarmFSM('A');
  const b = new AlarmFSM('B');

  expect(a.name).toBe('A');
  expect(b.name).toBe('B');

  expect(a.state).toBe('green');
  expect(b.state).toBe('green');

  a.warn (); expect(a.state).toBe('yellow'); expect(b.state).toBe('green');
  a.panic(); expect(a.state).toBe('red');    expect(b.state).toBe('green');
  a.calm (); expect(a.state).toBe('yellow'); expect(b.state).toBe('green');
  a.clear(); expect(a.state).toBe('green');  expect(b.state).toBe('green');

  b.warn();  expect(a.state).toBe('green'); expect(b.state).toBe('yellow');
  b.panic(); expect(a.state).toBe('green'); expect(b.state).toBe('red');
  b.calm();  expect(a.state).toBe('green'); expect(b.state).toBe('yellow');
  b.clear(); expect(a.state).toBe('green'); expect(b.state).toBe('green');
});

export {}