//lifecycle.test.ts
/// <reference types="jest" />
import StateMachine    from '../src/app/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('lifecycle events occur in correct order', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('none');

  fsm.step();

  expect(fsm.state).toBe('complete');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none'     },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ]);

});

test('lifecycle events occur in correct order - for same state transition', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('none');

  fsm.noop();

  expect(fsm.state).toBe('none');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onBeforeNoop',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onTransition',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterTransition',  transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterNoop',        transition: 'noop', from: 'none', to: 'none', current: 'none' }
  ]);

});

test('lifecycle events using shortcut names', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('solid');

  expect(logger.log).toEqual([
    { event: "onSolid", transition: "init", from: "none", to: "solid", current: "solid" },
    { event: "onInit",  transition: "init", from: "none", to: "solid", current: "solid" }
  ]);

  logger.clear();
  fsm.melt();
  expect(fsm.state).toBe('liquid');

  expect(logger.log).toEqual([
    { event: "onLiquid", transition: "melt", from: "solid", to: "liquid", current: "liquid" },
    { event: "onMelt",   transition: "melt", from: "solid", to: "liquid", current: "liquid" }
  ]);

});

test('lifecycle events with dash or underscore are camelized', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('has-dash');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'has-dash', current: 'none'     },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' },
    { event: 'onEnterHasDash',     transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'has-dash', current: 'has-dash' }
  ]);

  logger.clear();
  fsm.doWithDash();
  expect(fsm.state).toBe('has_underscore');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition',   transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onBeforeDoWithDash',   transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onLeaveState',         transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onLeaveHasDash',       transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onTransition',         transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has-dash'       },
    { event: 'onEnterState',         transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' },
    { event: 'onEnterHasUnderscore', transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' },
    { event: 'onAfterTransition',    transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' },
    { event: 'onAfterDoWithDash',    transition: 'do-with-dash', from: 'has-dash', to: 'has_underscore', current: 'has_underscore' }
  ]);

  logger.clear();
  fsm.doWithUnderscore();
  expect(fsm.state).toBe('alreadyCamelized');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition',       transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onBeforeDoWithUnderscore', transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onLeaveState',             transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onLeaveHasUnderscore',     transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onTransition',             transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'has_underscore'   },
    { event: 'onEnterState',             transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' },
    { event: 'onEnterAlreadyCamelized',  transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' },
    { event: 'onAfterTransition',        transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' },
    { event: 'onAfterDoWithUnderscore',  transition: 'do_with_underscore', from: 'has_underscore', to: 'alreadyCamelized', current: 'alreadyCamelized' }
  ]);

  logger.clear();
  fsm.doAlreadyCamelized();
  expect(fsm.state).toBe('has-dash');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition',         transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onBeforeDoAlreadyCamelized', transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onLeaveState',               transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onLeaveAlreadyCamelized',    transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onTransition',               transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'alreadyCamelized' },
    { event: 'onEnterState',               transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         },
    { event: 'onEnterHasDash',             transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         },
    { event: 'onAfterTransition',          transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         },
    { event: 'onAfterDoAlreadyCamelized',  transition: 'doAlreadyCamelized', from: 'alreadyCamelized', to: 'has-dash', current: 'has-dash'         }
  ]);

});

test('lifecycle event names that are all uppercase are camelized', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('FIRST');
  expect(logger.log).toEqual([
    { event: 'onEnterFirst', transition: 'init', from: 'none', to: 'FIRST', current: 'FIRST' },
  ])

  logger.clear()
  fsm.go()
  expect(fsm.state).toBe('SECOND_STATE');
  expect(logger.log).toEqual([
    { event: 'onBeforeGo',         transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'FIRST'        },
    { event: 'onLeaveFirst',       transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'FIRST'        },
    { event: 'onEnterSecondState', transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'SECOND_STATE' },
    { event: 'onAfterGo',          transition: 'GO', from: 'FIRST', to: 'SECOND_STATE', current: 'SECOND_STATE' }
  ])

  logger.clear();
  fsm.doIt();
  expect(fsm.state).toBe('FIRST');
  expect(logger.log).toEqual([
    { event: 'onBeforeDoIt',       transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'SECOND_STATE' },
    { event: 'onLeaveSecondState', transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'SECOND_STATE' },
    { event: 'onEnterFirst',       transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'FIRST'        },
    { event: 'onAfterDoIt',        transition: 'DO_IT', from: 'SECOND_STATE', to: 'FIRST', current: 'FIRST'        }
  ]);

});

test('lifecycle events receive arbitrary transition arguments', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('none');
  expect(logger.log).toEqual([]);

  fsm.init();

  expect(fsm.state).toBe('A');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'A', current: 'none' },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'A', current: 'A'    },
    { event: 'onEnterA',           transition: 'init', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'A', current: 'A'    }
  ]);
  logger.clear();

  fsm.step('with', 4, 'more', 'arguments');

  expect(fsm.state).toBe('B');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onLeaveState',       transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onLeaveA',           transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onTransition',       transition: 'step', from: 'A', to: 'B', current: 'A', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onEnterState',       transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onEnterB',           transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] },
    { event: 'onAfterStep',        transition: 'step', from: 'A', to: 'B', current: 'B', args: [ 'with', 4, 'more', 'arguments' ] }
  ]);

});

test('lifecycle events are cancelable', () => {

  const FSM = StateMachine.factory({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    data: function(cancel) {
      return {
        cancel: cancel,
        // @ts-ignore
        logger: new LifecycleLogger(),
      }
    },
    methods: {
      // @ts-ignore
      onBeforeTransition: function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onBeforeStep:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onEnterState:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onEnterNone:        function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onEnterComplete:    function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onTransition:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onLeaveState:       function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onLeaveNone:        function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onLeaveComplete:    function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onAfterTransition:  function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel },
      // @ts-ignore
      onAfterStep:        function(lifecycle) { this.logger(lifecycle); return lifecycle.event !== this.cancel }
    },
  });

  const cancelledBeforeTransition = new FSM('onBeforeTransition');
  const cancelledBeforeStep       = new FSM('onBeforeStep');
  const cancelledLeaveState       = new FSM('onLeaveState');
  const cancelledLeaveNone        = new FSM('onLeaveNone');
  const cancelledTransition       = new FSM('onTransition');
  const cancelledEnterState       = new FSM('onEnterState');
  const cancelledEnterComplete    = new FSM('onEnterComplete');
  const cancelledAfterTransition  = new FSM('onAfterTransition');
  const cancelledAfterStep        = new FSM('onAfterStep');

  expect(cancelledBeforeTransition.state).toBe('none');
  expect(cancelledBeforeStep.state).toBe('none');
  expect(cancelledLeaveState.state).toBe('none');
  expect(cancelledLeaveNone.state).toBe('none');
  expect(cancelledTransition.state).toBe('none');
  expect(cancelledEnterState.state).toBe('none');
  expect(cancelledEnterComplete.state).toBe('none');
  expect(cancelledAfterTransition.state).toBe('none');
  expect(cancelledAfterStep.state).toBe('none');

  cancelledBeforeTransition.step();
  cancelledBeforeStep.step();
  cancelledLeaveState.step();
  cancelledLeaveNone.step();
  cancelledTransition.step();
  cancelledEnterState.step();
  cancelledEnterComplete.step();
  cancelledAfterTransition.step();
  cancelledAfterStep.step();

  expect(cancelledBeforeTransition.state).toBe('none');
  expect(cancelledBeforeStep.state).toBe('none');
  expect(cancelledLeaveState.state).toBe('none');
  expect(cancelledLeaveNone.state).toBe('none');
  expect(cancelledTransition.state).toBe('none');
  expect(cancelledEnterState.state).toBe('complete');
  expect(cancelledEnterComplete.state).toBe('complete');
  expect(cancelledAfterTransition.state).toBe('complete');
  expect(cancelledAfterStep.state).toBe('complete');

  expect(cancelledBeforeTransition.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ]);

  expect(cancelledBeforeStep.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ]);

  expect(cancelledLeaveState.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ]);

  expect(cancelledLeaveNone.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ]);

  expect(cancelledTransition.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' }
  ]);

  expect(cancelledEnterState.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ]);

  expect(cancelledEnterComplete.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ]);

  expect(cancelledAfterTransition.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ]);

  expect(cancelledAfterStep.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none' },
    { event: 'onEnterState',       transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'step', from: 'none', to: 'complete', current: 'complete' },
    { event: 'onAfterStep',        transition: 'step', from: 'none', to: 'complete', current: 'complete' }
  ]);

});


test('lifecycle events can be deferred using a promise', async () => {
  // @ts-ignore
  const logger = new LifecycleLogger();
  const start = Date.now();
  const pause = function(ms) { return new Promise(function(resolve, reject) { setTimeout(function() { resolve('resolved') }, ms); }); };
  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    methods: {
      // @ts-ignore
      onBeforeTransition: function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onBeforeStep:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onEnterState:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onEnterNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onEnterComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      // @ts-ignore
      onTransition:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      // @ts-ignore
      onLeaveState:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onLeaveNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onLeaveComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onAfterTransition:  function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); },
      onAfterStep:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100); }
    }
  });

  function done(answer) {
    const duration = Date.now() - start;
    expect(fsm.state).toBe('complete');
    expect(duration > 600).toBe(true);
    expect(logger.log).toEqual([
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
    expect(answer).toBe('resolved');
  }

  await fsm.step('additional', 'arguments')
    .then(done);
});

test('lifecycle events can be cancelled using a promise', async () => {
  // @ts-ignore
  const logger = new LifecycleLogger();
  const start = Date.now();
  const pause = function(ms) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() { resolve('resolved') }, ms);
    });
  };
  const cancel = function(ms) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() { reject('rejected'); }, ms);
    });
  };
  const fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    methods: {
      // @ts-ignore
      onBeforeTransition: function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
      onBeforeStep:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
      onEnterState:       function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
      onEnterNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
      onEnterComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); return pause(100);  },
      // @ts-ignore
      onTransition:       function(lifecycle, a, b) { logger(lifecycle, a, b); return cancel(100); },
      // @ts-ignore
      onLeaveState:       function(lifecycle, a, b) { logger(lifecycle, a, b); },
      onLeaveNone:        function(lifecycle, a, b) { logger(lifecycle, a, b); },
      onLeaveComplete:    function(lifecycle, a, b) { logger(lifecycle, a, b); },
      onAfterTransition:  function(lifecycle, a, b) { logger(lifecycle, a, b); },
      onAfterStep:        function(lifecycle, a, b) { logger(lifecycle, a, b); }
    }
  });

  function done(answer) {
    const duration = Date.now() - start;
    expect(fsm.state).toBe('none');
    expect(duration > 300).toBe(true);
    expect(logger.log).toEqual([
      { event: 'onBeforeTransition', transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
      { event: 'onBeforeStep',       transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
      { event: 'onLeaveState',       transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
      { event: 'onLeaveNone',        transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] },
      { event: 'onTransition',       transition: 'step', from: 'none', to: 'complete', current: 'none', args: [ 'additional', 'arguments' ] }
    ]);
    expect(answer).toBe('rejected');
  }

  await fsm.step('additional', 'arguments')
    .then(function() { done('promise was rejected so this should never happen'); })
    .catch(done)

});

test('transition cannot fire while lifecycle event is in progress', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A', to: 'B' },
      { name: 'other', from: '*', to: 'X' }
    ],
    methods: {

      onBeforeStep: function(lifecycle) {
        // @ts-ignore
        expect(this.can('other')).toBe(false);
        try {
          fsm.other();
        } catch (e) {
          expect(e.message).toBe('transition is invalid while previous transition is still in progress');
          expect(e.transition).toBe('other');
          expect(e.from).toBe('A');
          expect(e.to).toBe('X');
          expect(e.current).toBe('A');
        }
      },

      onAfterStep: function(lifecycle) {
        // @ts-ignore
        expect(this.can('other')).toBe(false);
        try {
          fsm.other();
        } catch (e) {
          expect(e.message).toBe('transition is invalid while previous transition is still in progress');
          expect(e.transition).toBe('other');
          expect(e.from).toBe('B');
          expect(e.to).toBe('X');
          expect(e.current).toBe('B');
        }
      },

      onBeforeOther: function(lifecycle) { throw new Error('should never happen'); },
      onAfterOther:  function(lifecycle) { throw new Error('should never happen'); },
      // @ts-ignore
      onLeaveA:      function(lifecycle) { expect(this.can('other')).toBe(false);    },
      // @ts-ignore
      onEnterB:      function(lifecycle) { expect(this.can('other')).toBe(false);    },
      onLeaveB:      function(lifecycle) { throw new Error('should never happen'); },
      onEnterX:      function(lifecycle) { throw new Error('should never happen'); },
      onLeaveX:      function(lifecycle) { throw new Error('should never happen'); }

    }
  });

  expect(fsm.state).toBe('A');
  expect(fsm.can('other')).toBe(true);

  fsm.step();

  expect(fsm.state).toBe('B');
  expect(fsm.can('other')).toBe(true);

});

test('transition cannot fire while asynchronous lifecycle event is in progress', async () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A', to: 'B' },
      { name: 'other', from: '*', to: 'X' }
    ],
    methods: {

      onBeforeStep: function(lifecycle) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // @ts-ignore
            expect(this.can('other')).toBe(false);
            try {
              fsm.other();
            } catch (e) {
              expect(e.message).toBe('transition is invalid while previous transition is still in progress');
              expect(e.transition).toBe('other');
              expect(e.from).toBe('A');
              expect(e.to).toBe('X');
              expect(e.current).toBe('A');
            }
            // @ts-ignore
            resolve();
          }, 200);
        });
      },

      onAfterStep: function(lifecycle) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // @ts-ignore
            expect(this.can('other')).toBe(false);
            try {
              fsm.other();
            } catch (e) {
              expect(e.message).toBe('transition is invalid while previous transition is still in progress');
              expect(e.transition).toBe('other');
              expect(e.from).toBe('B');
              expect(e.to).toBe('X');
              expect(e.current).toBe('B');
            }
            // @ts-ignore
            resolve();
            setTimeout(done, 0); // HACK - let lifecycle finish before calling done()
          }, 200);
        });
      },

      onBeforeOther: function(lifecycle) { throw new Error('should never happen'); },
      onAfterOther:  function(lifecycle) { throw new Error('should never happen'); },
      // @ts-ignore
      onLeaveA:      function(lifecycle) { expect(this.can('other')).toBe(false);    },
      // @ts-ignore
      onEnterB:      function(lifecycle) { expect(this.can('other')).toBe(false);    },
      onLeaveB:      function(lifecycle) { throw new Error('should never happen'); },
      onEnterX:      function(lifecycle) { throw new Error('should never happen'); },
      onLeaveX:      function(lifecycle) { throw new Error('should never happen'); }

    }
  });


  expect(fsm.state).toBe('A');
  expect(fsm.can('other')).toBe(true);

  function done() {
    expect(fsm.state).toBe('B');
    expect(fsm.can('other')).toBe(true);
  }

  await fsm.step(); // kick off the async behavior

});

test('lifecycle events for transitions with multiple :from or :to states', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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


  expect(fsm.state).toBe('hungry');
  logger.clear();

  fsm.eat();
  expect(fsm.state).toBe('satisfied');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onBeforeEat',        transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onLeaveState',       transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onLeaveHungry',      transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onTransition',       transition: 'eat', from: 'hungry', to: 'satisfied', current: 'hungry' },
    { event: 'onEnterState',       transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' },
    { event: 'onEnterSatisfied',   transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' },
    { event: 'onAfterTransition',  transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' },
    { event: 'onAfterEat',         transition: 'eat', from: 'hungry', to: 'satisfied', current: 'satisfied' }
  ]);

  logger.clear();
  fsm.eat();
  expect(fsm.state).toBe('full');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onBeforeEat',        transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onLeaveState',       transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onLeaveSatisfied',   transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onTransition',       transition: 'eat', from: 'satisfied', to: 'full', current: 'satisfied' },
    { event: 'onEnterState',       transition: 'eat', from: 'satisfied', to: 'full', current: 'full' },
    { event: 'onEnterFull',        transition: 'eat', from: 'satisfied', to: 'full', current: 'full' },
    { event: 'onAfterTransition',  transition: 'eat', from: 'satisfied', to: 'full', current: 'full' },
    { event: 'onAfterEat',         transition: 'eat', from: 'satisfied', to: 'full', current: 'full' }
  ]);

  logger.clear();
  fsm.rest();
  expect(fsm.state).toBe('hungry');
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onBeforeRest',       transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onLeaveState',       transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onLeaveFull',        transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onTransition',       transition: 'rest', from: 'full', to: 'hungry', current: 'full'   },
    { event: 'onEnterState',       transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' },
    { event: 'onEnterHungry',      transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' },
    { event: 'onAfterTransition',  transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' },
    { event: 'onAfterRest',        transition: 'rest', from: 'full', to: 'hungry', current: 'hungry' }
  ]);

});

test('lifecycle events for factory generated state machines', () => {

  const FSM = StateMachine.factory({
    transitions: [
      { name: 'stepA', from: 'none', to: 'A' },
      { name: 'stepB', from: 'none', to: 'B' }
    ],
    data: function(name) {
      return {
        name:   name,
        // @ts-ignore
        logger: new LifecycleLogger()
      }
    },
    methods: {
      // @ts-ignore
      onBeforeTransition: function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onBeforeStepA:      function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onBeforeStepB:      function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onLeaveState:       function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onLeaveNone:        function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onLeaveA:           function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onLeaveB:           function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onTransition:       function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onEnterState:       function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onEnterNone:        function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onEnterA:           function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onEnterB:           function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onAfterTransition:  function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onAfterStepA:       function(lifecycle) { this.logger(lifecycle) },
      // @ts-ignore
      onAfterStepB:       function(lifecycle) { this.logger(lifecycle) }
    }
  });

  const a = new FSM('a'),
    b = new FSM('b');

  expect(a.state).toBe('none');
  expect(b.state).toBe('none');

  expect(a.logger.log).toEqual([]);
  expect(b.logger.log).toEqual([]);

  a.stepA();
  b.stepB();

  expect(a.state).toBe('A');
  expect(b.state).toBe('B');

  expect(a.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onBeforeStepA',      transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveState',       transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onLeaveNone',        transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onTransition',       transition: 'stepA', from: 'none', to: 'A', current: 'none' },
    { event: 'onEnterState',       transition: 'stepA', from: 'none', to: 'A', current: 'A'    },
    { event: 'onEnterA',           transition: 'stepA', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterTransition',  transition: 'stepA', from: 'none', to: 'A', current: 'A'    },
    { event: 'onAfterStepA',       transition: 'stepA', from: 'none', to: 'A', current: 'A'    }
  ]);

  expect(b.logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onBeforeStepB',      transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onLeaveState',       transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onLeaveNone',        transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onTransition',       transition: 'stepB', from: 'none', to: 'B', current: 'none' },
    { event: 'onEnterState',       transition: 'stepB', from: 'none', to: 'B', current: 'B'    },
    { event: 'onEnterB',           transition: 'stepB', from: 'none', to: 'B', current: 'B'    },
    { event: 'onAfterTransition',  transition: 'stepB', from: 'none', to: 'B', current: 'B'    },
    { event: 'onAfterStepB',       transition: 'stepB', from: 'none', to: 'B', current: 'B'    }
  ]);

});

test('lifecycle events for custom init transition', () => {

  // @ts-ignore
  const logger = new LifecycleLogger();
  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('complete');

  expect(fsm.allStates()).toEqual([ 'booting', 'complete' ]);
  expect(fsm.allTransitions()).toEqual([ 'boot' ]);
  expect(fsm.transitions()).toEqual([ ]);

  expect(logger.log).toEqual([
    { event: 'onBeforeTransition', transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onBeforeBoot',       transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onLeaveState',       transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onLeaveBooting',     transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onTransition',       transition: 'boot', from: 'booting', to: 'complete', current: 'booting'  },
    { event: 'onEnterState',       transition: 'boot', from: 'booting', to: 'complete', current: 'complete' },
    { event: 'onEnterComplete',    transition: 'boot', from: 'booting', to: 'complete', current: 'complete' },
    { event: 'onAfterTransition',  transition: 'boot', from: 'booting', to: 'complete', current: 'complete' },
    { event: 'onAfterBoot',        transition: 'boot', from: 'booting', to: 'complete', current: 'complete' }
  ]);

});

export {}