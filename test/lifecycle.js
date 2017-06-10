import test            from 'ava'
import StateMachine    from '../src/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('lifecycle events occur in correct order', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'step', from: 'none',  to: 'complete' }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeStep:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveComplete:    logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterComplete:    logger,
          onAfterTransition:  logger,
          onAfterStep:        logger
        }
      });

  t.is(fsm.state, 'none')

  fsm.step()

  t.is(fsm.state, 'complete')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events occur in correct order - for same state transition', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'noop', from: 'none',  to: 'none' }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeNoop:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveComplete:    logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterComplete:    logger,
          onAfterTransition:  logger,
          onAfterNoop:        logger
        }
      });

  t.is(fsm.state, 'none')

  fsm.noop()

  t.is(fsm.state, 'none')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onBeforeNoop',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onTransition',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterTransition',  transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterNoop',        transition: 'noop', from: 'none', to: 'none', current: 'none' }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events using shortcut names', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'solid',
        transitions: [
          { name: 'melt',     from: 'solid',  to: 'liquid' },
          { name: 'freeze',   from: 'liquid', to: 'solid'  },
          { name: 'vaporize', from: 'liquid', to: 'gas'    },
          { name: 'condense', from: 'gas',    to: 'liquid' }
        ],
        methods: {
          onNone:     logger,
          onSolid:    logger,
          onLiquid:   logger,
          onGas:      logger,
          onInit:     logger,
          onMelt:     logger,
          onFreeze:   logger,
          onVaporize: logger,
          onCondense: logger
        }
      });

  t.is(fsm.state, 'solid')

  t.deepEqual(logger.log, [
    { event: "onSolid", transition: "init", from: "none", to: "solid", current: "solid" },
    { event: "onInit",  transition: "init", from: "none", to: "solid", current: "solid" }
  ])

  logger.clear()
  fsm.melt()
  t.is(fsm.state, 'liquid')

  t.deepEqual(logger.log, [
    { event: "onLiquid", transition: "melt", from: "solid", to: "liquid", current: "liquid" },
    { event: "onMelt",   transition: "melt", from: "solid", to: "liquid", current: "liquid" }
  ]);

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events with dash or underscore are camelized', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'has-dash',
        transitions: [
          { name: 'do-with-dash',       from: 'has-dash',         to: 'has_underscore' },
          { name: 'do_with_underscore', from: 'has_underscore',   to: 'alreadyCamelized' },
          { name: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash' }
        ],
        methods: {
          onBeforeTransition:         logger,
          onBeforeInit:               logger,
          onBeforeDoWithDash:         logger,
          onBeforeDoWithUnderscore:   logger,
          onBeforeDoAlreadyCamelized: logger,
          onLeaveState:               logger,
          onLeaveNone:                logger,
          onLeaveHasDash:             logger,
          onLeaveHasUnderscore:       logger,
          onLeaveAlreadyCamelized:    logger,
          onTransition:               logger,
          onEnterState:               logger,
          onEnterNone:                logger,
          onEnterHasDash:             logger,
          onEnterHasUnderscore:       logger,
          onEnterAlreadyCamelized:    logger,
          onAfterTransition:          logger,
          onAfterInit:                logger,
          onAfterDoWithDash:          logger,
          onAfterDoWithUnderscore:    logger,
          onAfterDoAlreadyCamelized:  logger
        }
      });

  t.is(fsm.state, 'has-dash')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' },
    { event: 'onEnterHasDash',     transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' }
  ])

  logger.clear()
  fsm.doWithDash()
  t.is(fsm.state, 'has_underscore')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition',   transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onBeforeDoWithDash',   transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onLeaveState',         transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onLeaveHasDash',       transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onTransition',         transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onEnterState',         transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' },
    { event: 'onEnterHasUnderscore', transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' },
    { event: 'onAfterTransition',    transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' },
    { event: 'onAfterDoWithDash',    transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' }
  ])

  logger.clear()
  fsm.doWithUnderscore()
  t.is(fsm.state, 'alreadyCamelized')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition',       transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onBeforeDoWithUnderscore', transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onLeaveState',             transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onLeaveHasUnderscore',     transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onTransition',             transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onEnterState',             transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' },
    { event: 'onEnterAlreadyCamelized',  transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' },
    { event: 'onAfterTransition',        transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' },
    { event: 'onAfterDoWithUnderscore',  transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' }
  ])

  logger.clear()
  fsm.doAlreadyCamelized()
  t.is(fsm.state, 'has-dash')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition',         transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onBeforeDoAlreadyCamelized', transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onLeaveState',               transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onLeaveAlreadyCamelized',    transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onTransition',               transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onEnterState',               transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         },
    { event: 'onEnterHasDash',             transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         },
    { event: 'onAfterTransition',          transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         },
    { event: 'onAfterDoAlreadyCamelized',  transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle event names that are all uppercase are camelized', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'FIRST',
        transitions: [
          { name: 'GO',    from: 'FIRST',        to: 'SECOND_STATE' },
          { name: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST'        }
        ],
        methods: {
          onBeforeGo:         logger,
          onBeforeDoIt:       logger,
          onLeaveFirst:       logger,
          onLeaveSecondState: logger,
          onEnterFirst:       logger,
          onEnterSecondState: logger,
          onAfterGo:          logger,
          onAfterDoIt:        logger
        }
      });

  t.is(fsm.state, 'FIRST')
  t.deepEqual(logger.log, [
    { event: 'onEnterFirst', transition: 'init', from: 'none', to: 'FIRST', current: 'FIRST' },
  ])

  logger.clear()
  fsm.go()
  t.is(fsm.state, 'SECOND_STATE')
  t.deepEqual(logger.log, [
    { event: 'onBeforeGo',         transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'FIRST'        },
    { event: 'onLeaveFirst',       transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'FIRST'        },
    { event: 'onEnterSecondState', transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'SECOND_STATE' },
    { event: 'onAfterGo',          transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'SECOND_STATE' }
  ])

  logger.clear();
  fsm.doIt();
  t.is(fsm.state, 'FIRST')
  t.deepEqual(logger.log, [
    { event: 'onBeforeDoIt',       transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'SECOND_STATE' },
    { event: 'onLeaveSecondState', transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'SECOND_STATE' },
    { event: 'onEnterFirst',       transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'FIRST'        },
    { event: 'onAfterDoIt',        transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'FIRST'        }
  ])

});

//-------------------------------------------------------------------------------------------------

test('lifecycle events receive arbitrary transition arguments', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'init', from: 'none', to: 'A' },
          { name: 'step', from: 'A',    to: 'B' }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeInit:       logger,
          onBeforeStep:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveA:           logger,
          onLeaveB:           logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterA:           logger,
          onEnterB:           logger,
          onAfterTransition:  logger,
          onAfterInit:        logger,
          onAfterStep:        logger
        }
      });

  t.is(fsm.state, 'none')
  t.deepEqual(logger.log, [])

  fsm.init()

  t.is(fsm.state, 'A')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'A', current: 'A'    },
    { event: 'onEnterA',           transition: 'init', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'A', current: 'A'    }
  ])
  logger.clear()

  fsm.step('with', 4, 'more', 'arguments')

  t.is(fsm.state, 'B')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onLeaveState',       transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onLeaveA',           transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onTransition',       transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onEnterState',       transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onEnterB',           transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onAfterStep',        transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events are cancelable', t => {

  var FSM = StateMachine.factory({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    data: function(cancel) {
      return {
        cancel: cancel,
        logger: new LifecycleLogger()
      }
    },
    methods: {
      onBeforeTransition: function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onBeforeStep:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onEnterState:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onEnterNone:        function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onEnterComplete:    function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onTransition:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onLeaveState:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onLeaveNone:        function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onLeaveComplete:    function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onAfterTransition:  function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      onAfterStep:        function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel }
    }
  });

  var cancelledBeforeTransition = new FSM('onBeforeTransition'),
      cancelledBeforeStep       = new FSM('onBeforeStep'),
      cancelledLeaveState       = new FSM('onLeaveState'),
      cancelledLeaveNone        = new FSM('onLeaveNone'),
      cancelledTransition       = new FSM('onTransition'),
      cancelledEnterState       = new FSM('onEnterState'),
      cancelledEnterComplete    = new FSM('onEnterComplete'),
      cancelledAfterTransition  = new FSM('onAfterTransition'),
      cancelledAfterStep        = new FSM('onAfterStep');

  t.is(cancelledBeforeTransition.state, 'none')
  t.is(cancelledBeforeStep.state,       'none')
  t.is(cancelledLeaveState.state,       'none')
  t.is(cancelledLeaveNone.state,        'none')
  t.is(cancelledTransition.state,       'none')
  t.is(cancelledEnterState.state,       'none')
  t.is(cancelledEnterComplete.state,    'none')
  t.is(cancelledAfterTransition.state,  'none')
  t.is(cancelledAfterStep.state,        'none')

  cancelledBeforeTransition.step()
  cancelledBeforeStep.step()
  cancelledLeaveState.step()
  cancelledLeaveNone.step()
  cancelledTransition.step()
  cancelledEnterState.step()
  cancelledEnterComplete.step()
  cancelledAfterTransition.step()
  cancelledAfterStep.step()

  t.is(cancelledBeforeTransition.state, 'none')
  t.is(cancelledBeforeStep.state,       'none')
  t.is(cancelledLeaveState.state,       'none')
  t.is(cancelledLeaveNone.state,        'none')
  t.is(cancelledTransition.state,       'none')
  t.is(cancelledEnterState.state,       'complete')
  t.is(cancelledEnterComplete.state,    'complete')
  t.is(cancelledAfterTransition.state,  'complete')
  t.is(cancelledAfterStep.state,        'complete')

  t.deepEqual(cancelledBeforeTransition.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ])

  t.deepEqual(cancelledBeforeStep.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ])

  t.deepEqual(cancelledLeaveState.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ])

  t.deepEqual(cancelledLeaveNone.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ])

  t.deepEqual(cancelledTransition.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ])

  t.deepEqual(cancelledEnterState.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ])

  t.deepEqual(cancelledEnterComplete.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ])

  t.deepEqual(cancelledAfterTransition.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ])

  t.deepEqual(cancelledAfterStep.logger.log, [
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events can be deferred using a promise', t => {
  return new Promise(function(resolveTest, rejectTest) {

    var logger = new LifecycleLogger(),
        start  = Date.now(),
        pause  = function(ms) { return new Promise(function(resolve, reject) { setTimeout(function() { resolve('resolved') }, ms); }); },
        fsm    = new StateMachine({
          transitions: [
            { name: 'step', from: 'none', to: 'complete' }
          ],
          methods: {
            onBeforeTransition: function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onBeforeStep:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onEnterState:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onEnterNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onEnterComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onTransition:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onLeaveState:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onLeaveNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onLeaveComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onAfterTransition:  function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
            onAfterStep:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); }
          }
        });

    function done(answer) {
      var duration = Date.now() - start;
      t.is(fsm.state, 'complete')
      t.is(duration > 600, true)
      t.deepEqual(logger.log, [
        { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
        { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
        { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
        { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
        { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none',     args: [ 'additional', 'arguments' ] },
        { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
        { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
        { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
        { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete', args: [ 'additional', 'arguments' ] },
      ])
      t.is(answer, 'resolved');
      resolveTest()
    }

    fsm.step('additional', 'arguments')
       .then(done);

  });
});

//-------------------------------------------------------------------------------------------------

test('lifecycle events can be cancelled using a promise', t => {
  return new Promise(function(resolveTest, rejectTest) {

    var logger = new LifecycleLogger(),
        start  = Date.now(),
        pause  = function(ms) {
          return new Promise(function(resolve, reject) {
            setTimeout(function() { resolve('resolved') }, ms);
          });
        },
        cancel = function(ms) {
          return new Promise(function(resolve, reject) {
            setTimeout(function() { reject('rejected'); }, ms);
          });
        },
        fsm = new StateMachine({
          transitions: [
            { name: 'step', from: 'none', to: 'complete' }
          ],
          methods: {
            onBeforeTransition: function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
            onBeforeStep:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
            onEnterState:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
            onEnterNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
            onEnterComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
            onTransition:       function(lifecycle, a, b) { logger(lifecycle, a, b); return cancel(100); },
            onLeaveState:       function(lifecycle, a, b) { logger(lifecycle, a, b); },
            onLeaveNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); },
            onLeaveComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); },
            onAfterTransition:  function(lifecycle, a, b) { logger(lifecycle, a, b); },
            onAfterStep:        function(lifecycle, a, b) { logger(lifecycle, a, b); }
          }
        });

    function done(answer) {
      var duration = Date.now() - start;
      t.is(fsm.state, 'none');
      t.is(duration > 300, true);
      t.deepEqual(logger.log, [
        { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
        { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
        { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
        { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
        { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] }
      ]);
      t.is(answer, 'rejected');
      resolveTest();
    }

    fsm.step('additional', 'arguments')
       .then(function() { done('promise was rejected so this should never happen'); })
       .catch(done)

  })
})

//-------------------------------------------------------------------------------------------------

test('transition cannot fire while lifecycle event is in progress', t => {

  t.plan(20);

  var fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step',  from: 'A', to: 'B' },
          { name: 'other', from: '*', to: 'X' }
        ],
        methods: {

          onBeforeStep: function(lifecycle) {
            t.false(this.can('other'));
            const error = t.throws(function() {
              fsm.other();
            });
            t.is(error.message, 'transition is invalid while previous transition is still in progress');
            t.is(error.transition, 'other');
            t.is(error.from,       'A');
            t.is(error.to,         'X');
            t.is(error.current,    'A');
          },

          onAfterStep: function(lifecycle) {
            t.false(this.can('other'));
            const error = t.throws(function() {
              fsm.other();
            });
            t.is(error.message, 'transition is invalid while previous transition is still in progress');
            t.is(error.transition, 'other');
            t.is(error.from,       'B');
            t.is(error.to,         'X');
            t.is(error.current,    'B');
          },

          onBeforeOther: function(lifecycle) { t.fail('should never happen') },
          onAfterOther:  function(lifecycle) { t.fail('should never happen') },
          onLeaveA:      function(lifecycle) { t.false(this.can('other'))    },
          onEnterB:      function(lifecycle) { t.false(this.can('other'))    },
          onLeaveB:      function(lifecycle) { t.fail('should never happen') },
          onEnterX:      function(lifecycle) { t.fail('should never happen') },
          onLeaveX:      function(lifecycle) { t.fail('should never happen') }

        }
      });

  t.is(fsm.state, 'A')
  t.true(fsm.can('other'))

  fsm.step()

  t.is(fsm.state, 'B')
  t.true(fsm.can('other'))

})

//-------------------------------------------------------------------------------------------------

test('transition cannot fire while asynchronous lifecycle event is in progress', t => {
  return new Promise(function(resolveTest, rejectTest) {

    t.plan(20);

    var fsm = new StateMachine({
          init: 'A',
          transitions: [
            { name: 'step',  from: 'A', to: 'B' },
            { name: 'other', from: '*', to: 'X' }
          ],
          methods: {

            onBeforeStep: function(lifecycle) {
              return new Promise(function(resolve, reject) {
                setTimeout(function() {
                  t.false(fsm.can('other'));
                  const error = t.throws(function() {
                    fsm.other();
                  });
                  t.is(error.message, 'transition is invalid while previous transition is still in progress');
                  t.is(error.transition, 'other');
                  t.is(error.from,       'A');
                  t.is(error.to,         'X');
                  t.is(error.current,    'A');
                  resolve();
                }, 200);
              });
            },

            onAfterStep: function(lifecycle) {
              return new Promise(function(resolve, reject) {
                setTimeout(function() {
                  t.false(fsm.can('other'));
                  const error = t.throws(function() {
                    fsm.other();
                  });
                  t.is(error.message, 'transition is invalid while previous transition is still in progress');
                  t.is(error.transition, 'other');
                  t.is(error.from,       'B');
                  t.is(error.to,         'X');
                  t.is(error.current,    'B');
                  resolve();
                  setTimeout(done, 0); // HACK - let lifecycle finish before calling done()
                }, 200);
              });
            },

            onBeforeOther: function(lifecycle) { t.fail('should never happen') },
            onAfterOther:  function(lifecycle) { t.fail('should never happen') },
            onLeaveA:      function(lifecycle) { t.false(this.can('other'))    },
            onEnterB:      function(lifecycle) { t.false(this.can('other'))    },
            onLeaveB:      function(lifecycle) { t.fail('should never happen') },
            onEnterX:      function(lifecycle) { t.fail('should never happen') },
            onLeaveX:      function(lifecycle) { t.fail('should never happen') }

          }
        });

    t.is(fsm.state, 'A')
    t.true(fsm.can('other'))

    function done() {
      t.is(fsm.state, 'B');
      t.true(fsm.can('other'));
      resolveTest();
    }

    fsm.step(); // kick off the async behavior

  })
})

//-------------------------------------------------------------------------------------------------

test('lifecycle events for transitions with multiple :from or :to states', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'hungry',
        transitions: [
          { name: 'eat',  from: 'hungry',                to: 'satisfied' },
          { name: 'eat',  from: 'satisfied',             to: 'full'      },
          { name: 'rest', from: [ 'satisfied', 'full' ], to: 'hungry'    }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeEat:        logger,
          onBeforeRest:       logger,
          onLeaveState:       logger,
          onLeaveHungry:      logger,
          onLeaveSatisfied:   logger,
          onLeaveFull:        logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterHungry:      logger,
          onEnterSatisfied:   logger,
          onEnterFull:        logger,
          onAfterTransition:  logger,
          onAfterEat:         logger,
          onAfterRest:        logger
        }
      });


  t.is(fsm.state, 'hungry')
  logger.clear()

  fsm.eat()
  t.is(fsm.state, 'satisfied')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onBeforeEat',        transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onLeaveState',       transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onLeaveHungry',      transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onTransition',       transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onEnterState',       transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' },
    { event: 'onEnterSatisfied',   transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' },
    { event: 'onAfterTransition',  transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' },
    { event: 'onAfterEat',         transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' }
  ])

  logger.clear()
  fsm.eat()
  t.is(fsm.state, 'full')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onBeforeEat',        transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onLeaveState',       transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onLeaveSatisfied',   transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onTransition',       transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onEnterState',       transition: 'eat', from: 'satisfied', to: 'full', current: 'full' },
    { event: 'onEnterFull',        transition: 'eat', from: 'satisfied', to: 'full', current: 'full' },
    { event: 'onAfterTransition',  transition: 'eat', from: 'satisfied', to: 'full', current: 'full' },
    { event: 'onAfterEat',         transition: 'eat', from: 'satisfied', to: 'full', current: 'full' }
  ])

  logger.clear()
  fsm.rest()
  t.is(fsm.state, 'hungry')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onBeforeRest',       transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onLeaveState',       transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onLeaveFull',        transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onTransition',       transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onEnterState',       transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' },
    { event: 'onEnterHungry',      transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' },
    { event: 'onAfterTransition',  transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' },
    { event: 'onAfterRest',        transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' }
  ])
  
})

//-------------------------------------------------------------------------------------------------

test('lifecycle events for factory generated state machines', t => {

  var FSM = StateMachine.factory({
    transitions: [
      { name: 'stepA', from: 'none', to: 'A' },
      { name: 'stepB', from: 'none', to: 'B' }
    ],
    data: function(name) {
      return {
        name:   name,
        logger: new LifecycleLogger()
      }
    },
    methods: {
      onBeforeTransition: function(lifecycle) { this.logger(lifecycle) },
      onBeforeStepA:      function(lifecycle) { this.logger(lifecycle) },
      onBeforeStepB:      function(lifecycle) { this.logger(lifecycle) },
      onLeaveState:       function(lifecycle) { this.logger(lifecycle) },
      onLeaveNone:        function(lifecycle) { this.logger(lifecycle) },
      onLeaveA:           function(lifecycle) { this.logger(lifecycle) },
      onLeaveB:           function(lifecycle) { this.logger(lifecycle) },
      onTransition:       function(lifecycle) { this.logger(lifecycle) },
      onEnterState:       function(lifecycle) { this.logger(lifecycle) },
      onEnterNone:        function(lifecycle) { this.logger(lifecycle) },
      onEnterA:           function(lifecycle) { this.logger(lifecycle) },
      onEnterB:           function(lifecycle) { this.logger(lifecycle) },
      onAfterTransition:  function(lifecycle) { this.logger(lifecycle) },
      onAfterStepA:       function(lifecycle) { this.logger(lifecycle) },
      onAfterStepB:       function(lifecycle) { this.logger(lifecycle) }
    }
  });

  var a = new FSM('a'),
      b = new FSM('b');

  t.is(a.state, 'none')
  t.is(b.state, 'none')

  t.deepEqual(a.logger.log, [])
  t.deepEqual(b.logger.log, [])

  a.stepA()
  b.stepB()

  t.is(a.state, 'A')
  t.is(b.state, 'B')

  t.deepEqual(a.logger.log, [
    { event: 'onBeforeTransition', transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onBeforeStepA',      transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveState',       transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveNone',        transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onTransition',       transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onEnterState',       transition: 'stepA', from: 'none', to: 'A', current: 'A'    },
    { event: 'onEnterA',           transition: 'stepA', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterTransition',  transition: 'stepA', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterStepA',       transition: 'stepA', from: 'none', to: 'A', current: 'A'    }
  ])

  t.deepEqual(b.logger.log, [
    { event: 'onBeforeTransition', transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onBeforeStepB',      transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onLeaveState',       transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onLeaveNone',        transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onTransition',       transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onEnterState',       transition: 'stepB', from: 'none', to: 'B', current: 'B'    },
    { event: 'onEnterB',           transition: 'stepB', from: 'none', to: 'B', current: 'B'    },
    { event: 'onAfterTransition',  transition: 'stepB', from: 'none', to: 'B', current: 'B'    },
    { event: 'onAfterStepB',       transition: 'stepB', from: 'none', to: 'B', current: 'B'    }
  ])

})

//-------------------------------------------------------------------------------------------------

test('lifecycle events for custom init transition', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: { name: 'boot', from: 'booting', to: 'complete' },
        methods: {
          onBeforeTransition: logger,
          onBeforeInit:       logger,
          onBeforeBoot:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveBooting:     logger,
          onLeaveComplete:    logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterBooting:     logger,
          onEnterComplete:    logger,
          onAfterTransition:  logger,
          onAfterInit:        logger,
          onAfterBoot:        logger
        }
      });

  t.is(fsm.state, 'complete')

  t.deepEqual(fsm.allStates(),      [ 'booting', 'complete' ])
  t.deepEqual(fsm.allTransitions(), [ 'boot' ])
  t.deepEqual(fsm.transitions(),    [ ])

  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onBeforeBoot',       transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onLeaveState',       transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onLeaveBooting',     transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onTransition',       transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onEnterState',       transition: 'boot', from: 'booting', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'boot', from: 'booting', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'boot', from: 'booting', to: 'complete', current: 'complete' },
    { event: 'onAfterBoot',        transition: 'boot', from: 'booting', to: 'complete', current: 'complete' }
  ])

})

//-------------------------------------------------------------------------------------------------
