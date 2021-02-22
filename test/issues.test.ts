import StateMachine    from '../src/app/app'

test('github issue #12 - transition return values', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'init',      from: 'none', to: 'A' },
      { name: 'cancelled', from: 'A',    to: 'X' },
      { name: 'async',     from: 'A',    to: 'X' }
    ],
    methods: {
      onBeforeCancelled: function() { return false; },
      onBeforeAsync:     function() { return new Promise(function(resolve, reject) {}); }
    }
  });

  try {
    expect(fsm.init()).toBe(true);
  } catch (e) {
    throw new Error('successful (synchronous) transition returns true')
  }
  try {
    expect(fsm.cancelled()).toBe(false);
  } catch (e) {
    throw new Error('cancelled (synchronous) transition returns true');
  }

  const promise = fsm.async();
  try {
    expect(typeof promise.then).toBe('function');
  } catch(e) {
    throw new Error('asynchronous transition returns a promise');
  }
});

test('github issue #17 - exceptions in lifecycle events are NOT swallowed', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    methods: {
      onTransition: function() { throw Error('oops') }
    }
  });

  expect(fsm.state).toBe('none');

  try {
    fsm.step();
  } catch (e) {
    expect(e.message).toBe('oops');
  }
});

//-------------------------------------------------------------------------------------------------

test('github issue #19 - lifecycle events have correct this when applying StateMachine to a custom class', () => {

  const FSM = function() {
    // @ts-ignore
    this.stepped = false;
    // @ts-ignore
    // this._fsm();
  }

  FSM.prototype.onStep = function(lifecycle) { this.stepped = true }

  const FSM2 = StateMachine.factory(FSM, {
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ]
  });

  const a = new FSM2(),
    b = new FSM2();

  expect(a.state).toBe('none');
  expect(b.state).toBe('none');
  expect(a.stepped).toBe(false);
  expect(b.stepped).toBe(false);

  a.step();

  expect(a.state).toBe('complete');
  expect(b.state).toBe('none');
  expect(a.stepped).toBe(true);
  expect(b.stepped).toBe(false);

});

test('github issue #64 - double wildcard transition does not change state', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from: '*' /* no-op */ }
    ]
  });

  expect(fsm.state).toBe('none');

  fsm.step(); expect(fsm.state).toBe('none');
  fsm.step(); expect(fsm.state).toBe('none');

});