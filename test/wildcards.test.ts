//transitions.test.ts
/// <reference types="jest" />
import StateMachine from '../src/app/app'

//-----------------------------------------------------------------------------

test('wildcard :from allows transition from any state', () => {

  const fsm = new StateMachine({
    init: 'stopped',
    transitions: [
      { name: 'prepare', from: 'stopped',      to: 'ready'   },
      { name: 'start',   from: 'ready',        to: 'running' },
      { name: 'resume',  from: 'paused',       to: 'running' },
      { name: 'pause',   from: 'running',      to: 'paused'  },
      { name: 'stop',    from: '*',            to: 'stopped' }
    ]
  });

  try {
    expect(fsm.state).toBe('stopped');
  } catch (e) {
    throw new Error('initial state should be stopped');
  }

  fsm.prepare(); expect(fsm.state).toBe('ready');
  fsm.stop();    expect(fsm.state).toBe('stopped');

  fsm.prepare(); expect(fsm.state).toBe('ready');
  fsm.start();   expect(fsm.state).toBe('running');
  fsm.stop();    expect(fsm.state).toBe('stopped');

  fsm.prepare(); expect(fsm.state).toBe('ready');
  fsm.start();   expect(fsm.state).toBe('running');
  fsm.pause();   expect(fsm.state).toBe('paused');
  fsm.stop();    expect(fsm.state).toBe('stopped');
  fsm.stop();    expect(fsm.state).toBe('stopped');

  try {
    expect(fsm.transitions()).toEqual(["prepare", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
  fsm.prepare();
  try {
    expect(fsm.transitions()).toEqual(["start", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
  fsm.start();
  try {
    expect(fsm.transitions()).toEqual(["pause", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
  fsm.stop();
  try {
    expect(fsm.transitions()).toEqual(["prepare", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
});

//-----------------------------------------------------------------------------

test('missing :from allows transition from any state', () => {

  const fsm = new StateMachine({
    init: 'stopped',
    transitions: [
      { name: 'prepare', from: 'stopped',      to: 'ready'   },
      { name: 'start',   from: 'ready',        to: 'running' },
      { name: 'resume',  from: 'paused',       to: 'running' },
      { name: 'pause',   from: 'running',      to: 'paused'  },
      { name: 'stop',    /* any from state */  to: 'stopped' }
    ]});

  try {
    expect(fsm.state).toBe('stopped');
  } catch (e) {
    throw new Error('initial state should be stopped');
  }

  fsm.prepare(); expect(fsm.state).toBe('ready');
  fsm.stop();    expect(fsm.state).toBe('stopped');

  fsm.prepare(); expect(fsm.state).toBe('ready');
  fsm.start();   expect(fsm.state).toBe('running');
  fsm.stop();    expect(fsm.state).toBe('stopped');

  fsm.prepare(); expect(fsm.state).toBe('ready');
  fsm.start();   expect(fsm.state).toBe('running');
  fsm.pause();   expect(fsm.state).toBe('paused');
  fsm.stop();    expect(fsm.state).toBe('stopped');

  try {
    expect(fsm.transitions()).toEqual(["prepare", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
  fsm.prepare();
  try {
    expect(fsm.transitions()).toEqual(["start", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
  fsm.start();
  try {
    expect(fsm.transitions()).toEqual(["pause", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }
  fsm.stop();
  try {
    expect(fsm.transitions()).toEqual(["prepare", "stop"]);
  } catch (e) {
    throw new Error('ensure wildcard transition (stop) is included in available transitions');
  }

});

//-----------------------------------------------------------------------------

test('wildcard :from allows transition to a state that is never declared in any other :from transition ', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step',  from: 'none', to: 'mystery'  }, // NOTE: 'mystery' is only ever declared in :to, never :from
      { name: 'other', from: '*',    to: 'complete' }
    ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.can('step')).toBe(true);
  expect(fsm.can('other')).toBe(true);

  fsm.step();

  expect(fsm.state).toBe('mystery');
  expect(fsm.can('step')).toBe(false);
  expect(fsm.can('other')).toBe(true);

});

//-----------------------------------------------------------------------------

test('wildcard :to allows no-op transitions', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'stayA', from: 'A', to: '*' },
      { name: 'stayB', from: 'B', to: '*' },
      { name: 'noop',  from: '*', to: '*' },
      { name: 'step',  from: 'A', to: 'B' }
    ]
  });

  expect(fsm.state).toBe('A');
  expect(fsm.can('noop')).toBe(true);
  expect(fsm.can('step')).toBe(true);
  expect(fsm.can('stayA')).toBe(true);
  expect(fsm.can('stayB')).toBe(false);

  fsm.stayA(); expect(fsm.state).toBe('A');
  fsm.noop();  expect(fsm.state).toBe('A');

  fsm.step();

  expect(fsm.state).toBe('B');
  expect(fsm.can('noop')).toBe(true);
  expect(fsm.can('step')).toBe(false);
  expect(fsm.can('stayA')).toBe(false);
  expect(fsm.can('stayB')).toBe(true);

  fsm.stayB(); expect(fsm.state).toBe('B');
  fsm.noop();  expect(fsm.state).toBe('B');

})

test('missing :to allows no-op transitions', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'stayA', from: 'A'  /* no-op */ },
      { name: 'stayB', from: 'B'  /* no-op */ },
      { name: 'noop',  from: '*'  /* no-op */ },
      { name: 'step',  from: 'A', to: 'B'     }
    ]
  });

  expect(fsm.state).toBe('A');
  expect(fsm.can('noop')).toBe(true);
  expect(fsm.can('step')).toBe(true);
  expect(fsm.can('stayA')).toBe(true);
  expect(fsm.can('stayB')).toBe(false);

  fsm.stayA(); expect(fsm.state).toBe('A');
  fsm.noop();  expect(fsm.state).toBe('A');

  fsm.step();

  expect(fsm.state).toBe('B');
  expect(fsm.can('noop')).toBe(true);
  expect(fsm.can('step')).toBe(false);
  expect(fsm.can('stayA')).toBe(false);
  expect(fsm.can('stayB')).toBe(true);

  fsm.stayB(); expect(fsm.state).toBe('B');
  fsm.noop();  expect(fsm.state).toBe('B');

});

test('no-op transitions with multiple from states', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',        to: 'B' },
      { name: 'noop1', from: ['A', 'B']  /* no-op */ },
      { name: 'noop2', from: '*'         /* no-op */ },
      { name: 'noop3', from: ['A', 'B'], to: '*' },
      { name: 'noop4', from: '*',        to: '*' }
    ]
  });

  expect(fsm.state).toBe('A');
  expect(fsm.can('step')).toBe(true);
  expect(fsm.can('noop1')).toBe(true);
  expect(fsm.can('noop2')).toBe(true);
  expect(fsm.can('noop3')).toBe(true);
  expect(fsm.can('noop4')).toBe(true);

  fsm.noop1(); expect(fsm.state).toBe('A');
  fsm.noop2(); expect(fsm.state).toBe('A');
  fsm.noop3(); expect(fsm.state).toBe('A');
  fsm.noop4(); expect(fsm.state).toBe('A');

  fsm.step();
  expect(fsm.state).toBe('B');
  expect(fsm.can('step')).toBe(false);
  expect(fsm.can('noop1')).toBe( true);
  expect(fsm.can('noop2')).toBe( true);
  expect(fsm.can('noop3')).toBe( true);
  expect(fsm.can('noop4')).toBe( true);

  fsm.noop1(); expect(fsm.state).toBe('B');
  fsm.noop2(); expect(fsm.state).toBe('B');
  fsm.noop3(); expect(fsm.state).toBe('B');
  fsm.noop4(); expect(fsm.state).toBe('B');

});
