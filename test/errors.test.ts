import StateMachine from '../src/app/app'

test('state cannot be modified directly', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ]
  })

  expect(fsm.state).toBe('none');
  try {
    fsm.state = 'other';
  } catch (e) {
    expect(e.message).toBe('use transitions to change state');
  }
  expect(fsm.state).toBe('none');
});

test('StateMachine.apply only allowed on objects', () => {

  const config = {
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ]
  };

  try {
    StateMachine.apply(function() {}, config)
  } catch (e) {
    expect(e.message).toBe('StateMachine can only be applied to objects');
  }

  try {
    StateMachine.apply([], config)
  } catch (e) {
    expect(e.message).toBe('StateMachine can only be applied to objects');
  }

  try {
    StateMachine.apply(42, config)
  } catch (e) {
    expect(e.message).toBe('StateMachine can only be applied to objects');
  }

});

test('invalid transition raises an exception', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step1', from: 'none', to: 'A' },
      { name: 'step2', from: 'A',    to: 'B' }
    ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.can('step1')).toBe(true)
  expect(fsm.can('step2')).toBe(false)

  try {
    fsm.step2();
  } catch (e) {
    expect(e.message).toBe('transition is invalid in current state');
    expect(e.transition).toBe('step2');
    expect(e.from).toBe('none');
    expect(e.to).toBe(undefined);
    expect(e.current).toBe('none');
  }
});

test('invalid transition handler can be customized', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step1', from: 'none', to: 'A' },
      { name: 'step2', from: 'A',    to: 'B' }
    ],
    methods: {
      onInvalidTransition: function() { return 'custom error'; }
    }
  });

  expect(fsm.state).toBe('none');
  expect(fsm.can('step1')).toBe( true);
  expect(fsm.can('step2')).toBe(false);
  expect(fsm.step2()).toBe('custom error');
  expect(fsm.state).toBe('none');

});

test('fire transition while existing transition is still in process raises an exception', () => {

  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from:  'none', to: 'A' },
      { name: 'other', from: '*',    to: 'X' }
    ],
    methods: {
      // @ts-ignore
      onBeforeStep:  function() { this.other();                 },
      onBeforeOther: function() { throw new Error('should never happen') },
      onEnterX:      function() { throw new Error('should never happen') }
    }
  });

  expect(fsm.state).toBe('none');
  expect(fsm.can('step')).toBe(true);
  expect(fsm.can('other')).toBe(true);

  try {
    fsm.step()
  } catch (e) {
    expect(e.message).toBe('transition is invalid while previous transition is still in progress');
    expect(e.transition).toBe('other');
    expect(e.from).toBe('none');
    expect(e.to).toBe('X');
    expect(e.current).toBe('none');
  }

  try {
    expect(fsm.state).toBe('none');
  } catch (e) {
    throw new Error('entire transition was cancelled by the exception')
  }
});

test('pending transition handler can be customized', () => {

  let error = "";
  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from:  'none', to: 'A' },
      { name: 'other', from: '*',    to: 'X' }
    ],
    methods: {
      // @ts-ignore
      onBeforeStep:        function() { error = this.other(); return false },
      onPendingTransition: function() { return 'custom error' },
      onBeforeOther:       function() { throw new Error('should never happen') },
      onEnterX:            function() { throw new Error('should never happen') }
    }
  });

  expect(fsm.state).toBe('none');
  expect(fsm.can('step')).toBe(true);
  expect(fsm.can('other')).toBe(true);
  expect(fsm.step()).toBe(false);
  expect(fsm.state).toBe('none');
  expect(error).toBe('custom error');

});