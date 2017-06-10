import test            from 'ava'
import StateMachine    from '../src/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('github issue #12 - transition return values', t => {

  var fsm = new StateMachine({
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

  t.is(fsm.init(),      true,  'successful (synchronous) transition returns true')
  t.is(fsm.cancelled(), false, 'cancelled (synchronous) transition returns true')

  var promise = fsm.async();
  t.is(typeof promise.then, 'function', 'asynchronous transition returns a promise');

})

//-------------------------------------------------------------------------------------------------

test('github issue #17 - exceptions in lifecycle events are NOT swallowed', t => {

  var fsm = new StateMachine({
              transitions: [
                { name: 'step', from: 'none', to: 'complete' }
              ],
              methods: {
                onTransition: function() { throw Error('oops') }
              }
            });

  t.is(fsm.state, 'none')

  const error = t.throws(() => {
    fsm.step();
  })

  t.is(error.message, 'oops')

})

//-------------------------------------------------------------------------------------------------

test('github issue #19 - lifecycle events have correct this when applying StateMachine to a custom class', t => {

  var FSM = function() {
    this.stepped = false;
    this._fsm();
  }

  FSM.prototype.onStep = function(lifecycle) { this.stepped = true }

  StateMachine.factory(FSM, {
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ]
  })

  var a = new FSM(),
      b = new FSM();

  t.is(a.state, 'none')
  t.is(b.state, 'none')
  t.is(a.stepped, false)
  t.is(b.stepped, false)

  a.step();

  t.is(a.state, 'complete')
  t.is(b.state, 'none')
  t.is(a.stepped, true)
  t.is(b.stepped, false)

});

//-------------------------------------------------------------------------------------------------

test('github issue #64 - double wildcard transition does not change state', t => {

  var fsm = new StateMachine({
    transitions: [
      { name: 'step', from: '*' /* no-op */ }
    ]
  });

  t.is(fsm.state, 'none')

  fsm.step(); t.is(fsm.state, 'none')
  fsm.step(); t.is(fsm.state, 'none')

})

//-------------------------------------------------------------------------------------------------
