import test            from 'ava'
import StateMachine    from '../src/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('lifecycle events can be observed by external observer methods', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'step', from: 'none', to: 'complete' }
        ]
      });

  fsm.observe("onBeforeTransition", logger)
  fsm.observe("onBeforeStep",       logger)
  fsm.observe("onLeaveState",       logger)
  fsm.observe("onLeaveNone",        logger)
  fsm.observe("onLeaveComplete",    logger)
  fsm.observe("onTransition",       logger)
  fsm.observe("onEnterState",       logger)
  fsm.observe("onEnterNone",        logger)
  fsm.observe("onEnterComplete",    logger)
  fsm.observe("onAfterTransition",  logger)
  fsm.observe("onAfterStep",        logger)

  fsm.step('additional', 'arguments')

  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events can be observed by external observer classes', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'step', from: 'none', to: 'complete' }
        ]
      });

  fsm.observe({
    "onBeforeTransition": logger,
    "onBeforeStep":       logger,
    "onLeaveState":       logger,
    "onLeaveNone":        logger,
    "onLeaveComplete":    logger,
    "onTransition":       logger,
    "onEnterState":       logger,
    "onEnterNone":        logger,
    "onEnterComplete":    logger,
    "onAfterTransition":  logger,
    "onAfterStep":        logger,
  })

  fsm.step('additional', 'arguments')

  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events can be observed by multiple observers', t => {

  var logger1 = new LifecycleLogger(),
      logger2 = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'step', from: 'none', to: 'complete' }
        ]
      });

  fsm.observe("onBeforeTransition", logger1)
  fsm.observe("onBeforeStep",       logger1)
  fsm.observe("onLeaveState",       logger1)
  fsm.observe("onLeaveNone",        logger1)
  fsm.observe("onLeaveComplete",    logger1)
  fsm.observe("onTransition",       logger1)
  fsm.observe("onEnterState",       logger1)
  fsm.observe("onEnterNone",        logger1)
  fsm.observe("onEnterComplete",    logger1)
  fsm.observe("onAfterTransition",  logger1)
  fsm.observe("onAfterStep",        logger1)

  fsm.observe({
    "onBeforeTransition": logger2,
    "onBeforeStep":       logger2,
    "onLeaveState":       logger2,
    "onLeaveNone":        logger2,
    "onLeaveComplete":    logger2,
    "onTransition":       logger2,
    "onEnterState":       logger2,
    "onEnterNone":        logger2,
    "onEnterComplete":    logger2,
    "onAfterTransition":  logger2,
    "onAfterStep":        logger2,
  })

  fsm.step('additional', 'arguments')

  t.deepEqual(logger1.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] }
  ])

  t.deepEqual(logger2.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] }
  ])

})

//-------------------------------------------------------------------------------------------------
