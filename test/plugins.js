import test            from 'ava'
import StateMachine    from '../src/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('an empty plugin object', t => {

  var plugin = {
        init: function(instance) {
          instance.plugged = true
        }
      };

  var fsm = new StateMachine({
        plugins: [ plugin ]
      });

  t.is(fsm.state, 'none')
  t.is(fsm.plugged, true)

})

//-------------------------------------------------------------------------------------------------

test('an empty plugin function', t => {

  var plugin = function() {
    return {
      init: function(instance) {
        instance.plugged = true
      }
    }
  };

  var fsm = new StateMachine({
    plugins: [ plugin ]
  });

  t.is(fsm.state, 'none')
  t.is(fsm.plugged, true)

})

//-------------------------------------------------------------------------------------------------

test('an empty plugin function with configuration', t => {

  var plugin = function(value) {
    return {
      init: function(instance) {
        instance.plugged = value
      }
    }
  };

  var fsm = new StateMachine({
    plugins: [ new plugin(42) ]
  });

  t.is(fsm.state, 'none')
  t.is(fsm.plugged, 42)

})

//-------------------------------------------------------------------------------------------------

test('plugin can add methods', t => {

  var plugin = {
    methods: {
      foo: function() { return 'FOO' },
      bar: function() { return 'BAR' }
    }
  };

  var fsm = new StateMachine({
    plugins: [ plugin ]
  });

  t.is(fsm.state, 'none')
  t.is(fsm.foo(), 'FOO')
  t.is(fsm.bar(), 'BAR')

})

//-------------------------------------------------------------------------------------------------

test('plugin can add properties', t => {

  var plugin = {
    properties: {
      color: { get: function() { return 'red' } }
    }
  };

  var fsm = new StateMachine({
    plugins: [ plugin ]
  });

  t.is(fsm.state, 'none')
  t.is(fsm.color, 'red')

})

//-------------------------------------------------------------------------------------------------

test('plugin lifecycle hook', t => {

  var plugin = {

    init: function(instance) {
      instance.logger = new LifecycleLogger();
    },

    lifecycle: function(instance, lifecycle) {
      instance.logger(lifecycle)
    }

  };

  var fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    plugins: [ plugin ]
  });

  t.is(fsm.state, 'none')
  t.deepEqual(fsm.logger.log, [])

  fsm.step()

  t.is(fsm.state, 'complete')
  t.deepEqual(fsm.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onComplete',         transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onStep',             transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ])

})

//-------------------------------------------------------------------------------------------------
