import test         from 'ava'
import StateMachine from '../src/app'

//-------------------------------------------------------------------------------------------------

test('singleton construction', t => {

  var fsm = new StateMachine({
    transitions: [
      { name: 'init',  from: 'none', to: 'A' },
      { name: 'step1', from: 'A',    to: 'B' },
      { name: 'step2', from: 'B',    to: 'C' }
    ]
  });

  t.is(fsm.state, 'none')

  t.deepEqual(fsm.allStates(),      [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm.allTransitions(), [ 'init', 'step1', 'step2' ])
  t.deepEqual(fsm.transitions(),    [ 'init' ])

})


//-------------------------------------------------------------------------------------------------

test('singleton construction - with init state', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  t.is(fsm.state, 'A')

  t.deepEqual(fsm.allStates(),      [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm.allTransitions(), [ 'init', 'step1', 'step2' ])
  t.deepEqual(fsm.transitions(),    [ 'step1' ])

})

//-------------------------------------------------------------------------------------------------

test('singleton construction - with init state and transition', t => {

  var fsm = new StateMachine({
    init: { name: 'boot', to: 'A' },
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  t.is(fsm.state, 'A')

  t.deepEqual(fsm.allStates(),      [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm.allTransitions(), [ 'boot', 'step1', 'step2' ])
  t.deepEqual(fsm.transitions(),    [ 'step1' ])

})

//-------------------------------------------------------------------------------------------------

test('singleton construction - with init state, transition, AND from state', t => {

  var fsm = new StateMachine({
    init: { name: 'boot', from: 'booting', to: 'A' },
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  t.is(fsm.state, 'A')

  t.deepEqual(fsm.allStates(),      [ 'booting', 'A', 'B', 'C' ])
  t.deepEqual(fsm.allTransitions(), [ 'boot', 'step1', 'step2' ])
  t.deepEqual(fsm.transitions(),    [ 'step1' ])

})

//-------------------------------------------------------------------------------------------------

test('singleton construction - with custom data and methods', t => {

  var fsm = new StateMachine({
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
        return this.state + ' - ' + this.value
      }
    }
  });

  t.is(fsm.state,  'A')
  t.is(fsm.value,  42)
  t.is(fsm.talk(), 'A - 42')

  fsm.step1()

  t.is(fsm.state,  'B')
  t.is(fsm.value,  42)
  t.is(fsm.talk(), 'B - 42')

  fsm.value = 99

  t.is(fsm.state,  'B')
  t.is(fsm.value,  99)
  t.is(fsm.talk(), 'B - 99')

})

//-------------------------------------------------------------------------------------------------

test('factory construction', t => {

  var MyClass = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' }
    ]
  });

  var fsm1 = new MyClass(),
      fsm2 = new MyClass(),
      fsm3 = new MyClass();

  fsm2.step1()
  fsm3.step1()
  fsm3.step2()

  t.is(fsm1.state, 'A')
  t.is(fsm2.state, 'B')
  t.is(fsm3.state, 'C')

  t.deepEqual(fsm1.allStates(), [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm2.allStates(), [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm3.allStates(), [ 'none', 'A', 'B', 'C' ])

  t.deepEqual(fsm1.allTransitions(), [ 'init', 'step1', 'step2' ])
  t.deepEqual(fsm2.allTransitions(), [ 'init', 'step1', 'step2' ])
  t.deepEqual(fsm3.allTransitions(), [ 'init', 'step1', 'step2' ])

  t.deepEqual(fsm1.transitions(), [ 'step1' ])
  t.deepEqual(fsm2.transitions(), [ 'step2' ])
  t.deepEqual(fsm3.transitions(), [         ])

  t.is(fsm1.allStates, MyClass.prototype.allStates)
  t.is(fsm2.allStates, MyClass.prototype.allStates)
  t.is(fsm3.allStates, MyClass.prototype.allStates)

})

//-------------------------------------------------------------------------------------------------

test('factory construction - with custom data and methods', t => {

  var MyClass = StateMachine.factory({
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
      talk: function() {
        return this.state + ' - ' + this.value
      }
    }
  });

  var fsm1 = new MyClass(1),
      fsm2 = new MyClass(2),
      fsm3 = new MyClass(3);

  t.is(fsm1.state, 'A')
  t.is(fsm2.state, 'A')
  t.is(fsm3.state, 'A')

  t.is(fsm1.talk(), 'A - 1')
  t.is(fsm2.talk(), 'A - 2')
  t.is(fsm3.talk(), 'A - 3')

  fsm2.step1()
  fsm3.step1()
  fsm3.step2()

  t.is(fsm1.state, 'A')
  t.is(fsm2.state, 'B')
  t.is(fsm3.state, 'C')

  t.is(fsm1.talk(), 'A - 1')
  t.is(fsm2.talk(), 'B - 2')
  t.is(fsm3.talk(), 'C - 3')

  t.deepEqual(fsm1.allStates(), [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm2.allStates(), [ 'none', 'A', 'B', 'C' ])
  t.deepEqual(fsm3.allStates(), [ 'none', 'A', 'B', 'C' ])

  t.deepEqual(fsm1.allTransitions(), [ 'init', 'step1', 'step2' ])
  t.deepEqual(fsm2.allTransitions(), [ 'init', 'step1', 'step2' ])
  t.deepEqual(fsm3.allTransitions(), [ 'init', 'step1', 'step2' ])

  t.deepEqual(fsm1.transitions(), [ 'step1' ])
  t.deepEqual(fsm2.transitions(), [ 'step2' ])
  t.deepEqual(fsm3.transitions(), [         ])

  t.is(fsm1.allStates, MyClass.prototype.allStates)
  t.is(fsm2.allStates, MyClass.prototype.allStates)
  t.is(fsm3.allStates, MyClass.prototype.allStates)

})

//-------------------------------------------------------------------------------------------------
