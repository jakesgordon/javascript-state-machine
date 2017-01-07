import test            from 'ava'
import StateMachine    from '../src/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

function goto(state) {
  return state
}

//-------------------------------------------------------------------------------------------------

test('goto transition', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step', from: 'A', to: 'B'  },
          { name: 'step', from: 'B', to: 'C'  },
          { name: 'step', from: 'C', to: 'D'  },
          { name: 'goto', from: '*', to: goto }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeInit:       logger,
          onBeforeStep:       logger,
          onBeforeGoto:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveA:           logger,
          onLeaveB:           logger,
          onLeaveC:           logger,
          onLeaveD:           logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterA:           logger,
          onEnterB:           logger,
          onEnterC:           logger,
          onEnterD:           logger,
          onAfterTransition:  logger,
          onAfterInit:        logger,
          onAfterStep:        logger,
          onAfterGoto:        logger
        }
      });

  t.is(fsm.state, 'A')
  t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.allTransitions(), [ 'init', 'step', 'goto' ])

  logger.clear()

  fsm.goto('C')

  t.is(fsm.state, 'C')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onBeforeGoto',       transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveState',       transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveA',           transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onTransition',       transition: 'goto', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onEnterState',       transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onEnterC',           transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterTransition',  transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterGoto',        transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C' ] }
  ])

})

//-------------------------------------------------------------------------------------------------

test('goto can have additional arguments', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step', from: 'A', to: 'B'  },
          { name: 'step', from: 'B', to: 'C'  },
          { name: 'step', from: 'C', to: 'D'  },
          { name: 'goto', from: '*', to: goto }
        ],
        methods: {
          onStep: logger,
          onGoto: logger
        }
      });

  t.is(fsm.state, 'A')
  t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.allTransitions(), [ 'init', 'step', 'goto' ])

  logger.clear()

  fsm.goto('C', 'with', 4, 'additional', 'arguments')

  t.is(fsm.state, 'C')
  t.deepEqual(logger.log, [
    { event: 'onGoto', transition: 'goto', from: 'A', to: 'C', current: 'C', args: [ 'C', 'with', 4, 'additional', 'arguments' ] }
  ])

})

//-------------------------------------------------------------------------------------------------

test('goto can go to an unknown state', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B'  },
      { name: 'step', from: 'B', to: 'C'  },
      { name: 'step', from: 'C', to: 'D'  },
      { name: 'goto', from: '*', to: goto }
    ]
  })

  t.is(fsm.state, 'A')
  t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'C', 'D' ]);

  fsm.goto('B')
  t.is(fsm.state, 'B')
  t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'C', 'D' ]);

  fsm.goto('X')
  t.is(fsm.state, 'X')
  t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'C', 'D', 'X' ]);
  
})

//-------------------------------------------------------------------------------------------------

test('goto can be configured with a custom name', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step', from: 'A', to: 'B'  },
          { name: 'step', from: 'B', to: 'C'  },
          { name: 'step', from: 'C', to: 'D'  },
          { name: 'jump', from: '*', to: goto }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeInit:       logger,
          onBeforeStep:       logger,
          onBeforeJump:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveA:           logger,
          onLeaveB:           logger,
          onLeaveC:           logger,
          onLeaveD:           logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterA:           logger,
          onEnterB:           logger,
          onEnterC:           logger,
          onEnterD:           logger,
          onAfterTransition:  logger,
          onAfterInit:        logger,
          onAfterStep:        logger,
          onAfterJump:        logger
        }
      });

  t.is(fsm.state, 'A')
  t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.allTransitions(), [ 'init', 'step', 'jump' ])
  t.is(fsm.goto, undefined)

  logger.clear()

  fsm.jump('C')

  t.is(fsm.state, 'C')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onBeforeJump',       transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveState',       transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onLeaveA',           transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onTransition',       transition: 'jump', from: 'A', to: 'C', current: 'A', args: [ 'C' ] },
    { event: 'onEnterState',       transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onEnterC',           transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterTransition',  transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] },
    { event: 'onAfterJump',        transition: 'jump', from: 'A', to: 'C', current: 'C', args: [ 'C' ] }
  ])

})

//-------------------------------------------------------------------------------------------------
