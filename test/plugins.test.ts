//plugins.test.ts
/// <reference types="jest" />
import StateMachine    from '../src/app/app'
import LifecycleLogger from './helpers/lifecycle_logger'

test('an empty plugin object', () => {

  const plugin = {
    init: function(instance) {
      instance.plugged = true
    }
  };

  const fsm = new StateMachine({
    plugins: [ plugin ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.plugged).toBe(true);

});

test('an empty plugin function', () => {

  const plugin = function() {
    return {
      init: function(instance) {
        instance.plugged = true
      }
    }
  };

  const fsm = new StateMachine({
    plugins: [ plugin ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.plugged).toBe(true);

});

test('an empty plugin function with configuration', () => {

  const plugin = function(value) {
    return {
      init: function(instance) {
        instance.plugged = value
      }
    }
  };

  const fsm = new StateMachine({
    // @ts-ignore
    plugins: [ new plugin(42) ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.plugged).toBe(42);

});

//-------------------------------------------------------------------------------------------------

test('plugin can add methods', () => {

  const plugin = {
    methods: {
      foo: function() { return 'FOO' },
      bar: function() { return 'BAR' }
    }
  };

  const fsm = new StateMachine({
    plugins: [ plugin ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.foo()).toBe('FOO');
  expect(fsm.bar()).toBe('BAR');

});

//-------------------------------------------------------------------------------------------------

test('plugin can add properties', () => {

  const plugin = {
    properties: {
      color: { get: function() { return 'red' } }
    }
  };

  const fsm = new StateMachine({
    plugins: [ plugin ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.color).toBe('red');

});

test('plugin lifecycle hook', () => {

  const plugin = {

    init: function(instance) {
      // @ts-ignore
      instance.logger = new LifecycleLogger();
    },

    lifecycle: function(instance, lifecycle) {
      instance.logger(lifecycle)
    }

  };

  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    plugins: [ plugin ]
  });

  expect(fsm.state).toBe('none');
  expect(fsm.logger.log).toEqual([]);

  fsm.step();

  expect(fsm.state).toBe('complete');
  expect(fsm.logger.log).toEqual([
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
  ]);

});

export {};