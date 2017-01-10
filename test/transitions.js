import test            from 'ava'
import StateMachine    from '../src/app'
import LifecycleLogger from './helpers/lifecycle_logger'

//-----------------------------------------------------------------------------

test('basic transition from state to state', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step1', from: 'A', to: 'B' },
      { name: 'step2', from: 'B', to: 'C' },
      { name: 'step3', from: 'C', to: 'D' }
    ]
  });

  t.is(fsm.state, 'A')

  fsm.step1(); t.is(fsm.state, 'B')
  fsm.step2(); t.is(fsm.state, 'C')
  fsm.step3(); t.is(fsm.state, 'D')

})

//-----------------------------------------------------------------------------

test('multiple transitions with same name', t => {

  var fsm = new StateMachine({
    init: 'hungry',
    transitions: [
      { name: 'eat',  from: 'hungry',    to: 'satisfied' },
      { name: 'eat',  from: 'satisfied', to: 'full'      },
      { name: 'eat',  from: 'full',      to: 'sick'      },
      { name: 'rest', from: '*',         to: 'hungry'    }
    ]
  });

  t.is(fsm.state, 'hungry')
  t.is(fsm.can('eat'),  true)
  t.is(fsm.can('rest'), true)

  fsm.eat()

  t.is(fsm.state, 'satisfied')
  t.is(fsm.can('eat'),  true)
  t.is(fsm.can('rest'), true)

  fsm.eat()

  t.is(fsm.state, 'full')
  t.is(fsm.can('eat'),  true)
  t.is(fsm.can('rest'), true)

  fsm.eat()

  t.is(fsm.state, 'sick')
  t.is(fsm.can('eat'),  false)
  t.is(fsm.can('rest'), true)

  fsm.rest()

  t.is(fsm.state, 'hungry')
  t.is(fsm.can('eat'),  true)
  t.is(fsm.can('rest'), true)

})

//-----------------------------------------------------------------------------

test('transitions with multiple from states', t => {

  var fsm = new StateMachine({
    transitions: [
      { name: 'start', from: 'none',              to: 'green'  },
      { name: 'warn',  from: ['green', 'red'],    to: 'yellow' },
      { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
      { name: 'clear', from: ['red', 'yellow'],   to: 'green'  }
    ]
  });

  t.deepEqual(fsm.allStates(),      [ 'none', 'green', 'yellow', 'red'  ])
  t.deepEqual(fsm.allTransitions(), [ 'start', 'warn', 'panic', 'clear' ])

  t.is(fsm.state, 'none')
  t.is(fsm.can('start'), true)
  t.is(fsm.can('warn'),  false)
  t.is(fsm.can('panic'), false)
  t.is(fsm.can('clear'), false)
  t.deepEqual(fsm.transitions(), ['start'])

  fsm.start()
  t.is(fsm.state, 'green')
  t.is(fsm.can('start'), false)
  t.is(fsm.can('warn'),  true)
  t.is(fsm.can('panic'), true)
  t.is(fsm.can('clear'), false)
  t.deepEqual(fsm.transitions(), ['warn', 'panic'])

  fsm.warn()
  t.is(fsm.state, 'yellow')
  t.is(fsm.can('start'), false)
  t.is(fsm.can('warn'),  false)
  t.is(fsm.can('panic'), true)
  t.is(fsm.can('clear'), true)
  t.deepEqual(fsm.transitions(), ['panic', 'clear'])

  fsm.panic()
  t.is(fsm.state, 'red')
  t.is(fsm.can('start'), false)
  t.is(fsm.can('warn'),  true)
  t.is(fsm.can('panic'), false)
  t.is(fsm.can('clear'), true)
  t.deepEqual(fsm.transitions(), ['warn', 'clear'])

  fsm.clear()
  t.is(fsm.state, 'green')
  t.is(fsm.can('start'), false)
  t.is(fsm.can('warn'),  true)
  t.is(fsm.can('panic'), true)
  t.is(fsm.can('clear'), false)
  t.deepEqual(fsm.transitions(), ['warn', 'panic'])

})

//-------------------------------------------------------------------------------------------------

test("transitions that dont change state, dont trigger enter/leave lifecycle events", t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        transitions: [
          { name: 'noop', from: 'none', to: 'none' }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeNoop:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onNone:             logger,
          onAfterTransition:  logger,
          onAfterNoop:        logger,
          onNoop:             logger
        }
      })

  t.is(fsm.state, 'none')
  t.deepEqual(logger.log, [])

  fsm.noop()

  t.is(fsm.state, 'none')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onBeforeNoop',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onTransition',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterTransition',  transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterNoop',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onNoop',             transition: 'noop', from: 'none', to: 'none', current: 'none' }
  ])

})

//-------------------------------------------------------------------------------------------------

test("transitions that dont change state, can be configured to trigger enter/leave lifecycle events", t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        observeUnchangedState: true,
        transitions: [
          { name: 'noop', from: 'none', to: 'none' }
        ],
        methods: {
          onBeforeTransition: logger,
          onBeforeNoop:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onNone:             logger,
          onAfterTransition:  logger,
          onAfterNoop:        logger,
          onNoop:             logger
        }
      })

  t.is(fsm.state, 'none')
  t.deepEqual(logger.log, [])

  fsm.noop()

  t.is(fsm.state, 'none')
  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onBeforeNoop',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onLeaveState',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onLeaveNone',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onTransition',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onEnterState',       transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onEnterNone',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onNone',             transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterTransition',  transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onAfterNoop',        transition: 'noop', from: 'none', to: 'none', current: 'none' },
    { event: 'onNoop',             transition: 'noop', from: 'none', to: 'none', current: 'none' }
  ])

})

//-------------------------------------------------------------------------------------------------

test("transition methods with dash or underscore are camelized", t => {

  var fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'do-with-dash',       from: 'A', to: 'B' },
          { name: 'do_with_underscore', from: 'B', to: 'C' },
          { name: 'doAlreadyCamelized', from: 'C', to: 'D' }
        ]
      });

                            t.is(fsm.state, 'A')
  fsm.doWithDash();         t.is(fsm.state, 'B')
  fsm.doWithUnderscore();   t.is(fsm.state, 'C')
  fsm.doAlreadyCamelized(); t.is(fsm.state, 'D')

})

//-------------------------------------------------------------------------------------------------

test('conditional transitions', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step', from: '*', to: function(n) { return this.skip(n) } },
        ],
        methods: {
          skip: function(amount) {
            var code = this.state.charCodeAt(0);
            return String.fromCharCode(code + (amount || 1));
          },
          onBeforeTransition: logger,
          onBeforeInit:       logger,
          onBeforeStep:       logger,
          onLeaveState:       logger,
          onLeaveNone:        logger,
          onLeaveA:           logger,
          onLeaveB:           logger,
          onLeaveG:           logger,
          onTransition:       logger,
          onEnterState:       logger,
          onEnterNone:        logger,
          onEnterA:           logger,
          onEnterB:           logger,
          onEnterG:           logger,
          onAfterTransition:  logger,
          onAfterInit:        logger,
          onAfterStep:        logger
        }
      });

  t.is(fsm.state, 'A')

  t.deepEqual(fsm.allStates(), [ 'none', 'A' ]);

  fsm.step();  t.is(fsm.state, 'B'); t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B' ])
  fsm.step(5); t.is(fsm.state, 'G'); t.deepEqual(fsm.allStates(), [ 'none', 'A', 'B', 'G' ])

  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition', transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onBeforeInit',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onLeaveState',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onLeaveNone',        transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onTransition',       transition: 'init', from: 'none', to: 'A', current: 'none'           },
    { event: 'onEnterState',       transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onEnterA',           transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onAfterTransition',  transition: 'init', from: 'none', to: 'A', current: 'A'              },
    { event: 'onAfterInit',        transition: 'init', from: 'none', to: 'A', current: 'A'              },

    { event: 'onBeforeTransition', transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onBeforeStep',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onLeaveState',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onLeaveA',           transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onTransition',       transition: 'step', from: 'A',    to: 'B', current: 'A'              },
    { event: 'onEnterState',       transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onEnterB',           transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onAfterTransition',  transition: 'step', from: 'A',    to: 'B', current: 'B'              },
    { event: 'onAfterStep',        transition: 'step', from: 'A',    to: 'B', current: 'B'              },

    { event: 'onBeforeTransition', transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onBeforeStep',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onLeaveState',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onLeaveB',           transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onTransition',       transition: 'step', from: 'B',    to: 'G', current: 'B', args: [ 5 ] },
    { event: 'onEnterState',       transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onEnterG',           transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onAfterTransition',  transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
    { event: 'onAfterStep',        transition: 'step', from: 'B',    to: 'G', current: 'G', args: [ 5 ] },
  ])

})

//-------------------------------------------------------------------------------------------------
