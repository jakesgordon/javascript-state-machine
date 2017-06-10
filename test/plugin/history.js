import test                from 'ava'
import StateMachine        from '../../src/app'
import StateMachineHistory from '../../src/plugin/history'
import LifecycleLogger     from '../helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('history', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

                  t.is(fsm.state, 'solid');  t.deepEqual(fsm.history, [ 'solid' ])
  fsm.melt();     t.is(fsm.state, 'liquid'); t.deepEqual(fsm.history, [ 'solid', 'liquid' ])
  fsm.vaporize(); t.is(fsm.state, 'gas');    t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])
  fsm.condense(); t.is(fsm.state, 'liquid'); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid' ]);

})

//-------------------------------------------------------------------------------------------------

test('history can be cleared', t => {

  var fsm = new StateMachine({
    transitions: [
      { name: 'init', from: 'none', to: 'A' },
      { name: 'step', from: 'A',    to: 'B' },
      { name: 'step', from: 'B',    to: 'C' },
      { name: 'step', from: 'C',    to: 'A' }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

  fsm.init()
  fsm.step()

  t.is(fsm.state, 'B')
  t.deepEqual(fsm.history, ['A', 'B'])

  fsm.clearHistory()

  t.is(fsm.state, 'B')
  t.deepEqual(fsm.history, [])

})

//-------------------------------------------------------------------------------------------------

test('history does not record no-op transitions', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' },
      { name: 'noop',     from: '*',      to: '*'      }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

                  t.is(fsm.state, 'solid');  t.deepEqual(fsm.history, [ 'solid' ])
  fsm.noop();     t.is(fsm.state, 'solid');  t.deepEqual(fsm.history, [ 'solid' ])
  fsm.melt();     t.is(fsm.state, 'liquid'); t.deepEqual(fsm.history, [ 'solid', 'liquid' ])
  fsm.noop();     t.is(fsm.state, 'liquid'); t.deepEqual(fsm.history, [ 'solid', 'liquid' ])
  fsm.vaporize(); t.is(fsm.state, 'gas');    t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])
  fsm.noop();     t.is(fsm.state, 'gas');    t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])

})

//-------------------------------------------------------------------------------------------------

test('history with configurable names', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      new StateMachineHistory({ name: 'memory', future: 'yonder' })
    ]
  })

                  t.is(fsm.state, 'solid');  t.deepEqual(fsm.memory, [ 'solid' ])
  fsm.melt();     t.is(fsm.state, 'liquid'); t.deepEqual(fsm.memory, [ 'solid', 'liquid' ])
  fsm.vaporize(); t.is(fsm.state, 'gas');    t.deepEqual(fsm.memory, [ 'solid', 'liquid', 'gas' ])
  fsm.condense(); t.is(fsm.state, 'liquid'); t.deepEqual(fsm.memory, [ 'solid', 'liquid', 'gas', 'liquid' ])

  t.is(fsm.canMemoryBack, true)
  t.is(fsm.canMemoryForward, false)
  t.deepEqual(fsm.yonder, [ ])

  fsm.memoryBack()

  t.is(fsm.state, 'gas')
  t.deepEqual(fsm.memory, [ 'solid', 'liquid', 'gas' ])
  t.deepEqual(fsm.yonder, [ 'liquid' ])

  fsm.clearMemory()
  t.deepEqual(fsm.memory, [])
  t.deepEqual(fsm.yonder, [])

})

//-------------------------------------------------------------------------------------------------

test('history, by default, just keeps growing', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      new StateMachineHistory()
    ]
  })

  t.is(fsm.state, 'solid')
  t.deepEqual(fsm.history, [ 'solid' ])

  fsm.melt();     t.deepEqual(fsm.history, [ 'solid', 'liquid' ])
  fsm.vaporize(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])
  fsm.condense(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid' ])
  fsm.freeze();   t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  fsm.melt();     t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid' ])
  fsm.vaporize(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid', 'gas' ])

})

//-------------------------------------------------------------------------------------------------

test('history can be limited to N entries', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      new StateMachineHistory({ max: 3 })
    ]
  })

  t.is(fsm.state, 'solid')
  t.deepEqual(fsm.history, [ 'solid' ])

  fsm.melt();     t.deepEqual(fsm.history, [ 'solid', 'liquid' ])
  fsm.vaporize(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])
  fsm.condense(); t.deepEqual(fsm.history, [ 'liquid', 'gas', 'liquid' ])
  fsm.freeze();   t.deepEqual(fsm.history, [ 'gas', 'liquid', 'solid' ])
  fsm.melt();     t.deepEqual(fsm.history, [ 'liquid', 'solid', 'liquid' ])
  fsm.vaporize(); t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])

})

//-------------------------------------------------------------------------------------------------

test('history back and forward', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

  t.is(fsm.state,          'A')
  t.is(fsm.canHistoryBack, false)
  t.deepEqual(fsm.history, [ 'A' ])
  t.deepEqual(fsm.future, [ ])

  var error = t.throws(() => {
    fsm.historyBack()
  })
  t.is(error.message, 'no history')

  fsm.step()
  fsm.step()
  fsm.step()

  t.is(fsm.state, 'D')
  t.is(fsm.canHistoryBack, true)
  t.is(fsm.canHistoryForward, false)
  t.deepEqual(fsm.history, [ 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.future, [])

  fsm.historyBack()
  t.is(fsm.state, 'C')
  t.deepEqual(fsm.history, [ 'A', 'B', 'C' ])
  t.deepEqual(fsm.future, [ 'D' ])
  t.is(fsm.canHistoryBack, true)
  t.is(fsm.canHistoryForward, true)

  fsm.historyBack()
  t.is(fsm.state, 'B')
  t.deepEqual(fsm.history, [ 'A', 'B' ])
  t.deepEqual(fsm.future, [ 'D', 'C' ])
  t.is(fsm.canHistoryBack, true)
  t.is(fsm.canHistoryForward, true)

  fsm.historyBack()
  t.is(fsm.state, 'A')
  t.deepEqual(fsm.history, [ 'A' ])
  t.deepEqual(fsm.future, [ 'D', 'C', 'B' ])
  t.is(fsm.canHistoryBack, false)
  t.is(fsm.canHistoryForward, true)

  fsm.historyForward()
  t.is(fsm.state, 'B')
  t.deepEqual(fsm.history, [ 'A', 'B' ])
  t.deepEqual(fsm.future, [ 'D', 'C' ])
  t.is(fsm.canHistoryBack, true)
  t.is(fsm.canHistoryForward, true)

  fsm.historyForward()
  t.is(fsm.state, 'C')
  t.deepEqual(fsm.history, [ 'A', 'B', 'C' ])
  t.deepEqual(fsm.future, [ 'D' ])
  t.is(fsm.canHistoryBack, true)
  t.is(fsm.canHistoryForward, true)

  fsm.step()
  t.is(fsm.state, 'D')
  t.deepEqual(fsm.history, [ 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.future, [ ])
  t.is(fsm.canHistoryBack, true)
  t.is(fsm.canHistoryForward, false)

  error = t.throws(() => {
    fsm.historyForward()
  })
  t.is(error.message, 'no history')

})

//-------------------------------------------------------------------------------------------------

test('history back and forward lifecycle events', t => {

  var logger = new LifecycleLogger(),
      fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step', from: 'A', to: 'B' },
          { name: 'step', from: 'B', to: 'C' },
          { name: 'step', from: 'C', to: 'D' }
        ],
        methods: {
          onBeforeTransition:     logger,
          onBeforeStep:           logger,
          onBeforeHistoryBack:    logger,
          onBeforeHistoryForward: logger,
          onLeaveState:           logger,
          onLeaveA:               logger,
          onLeaveB:               logger,
          onLeaveC:               logger,
          onLeaveD:               logger,
          onTransition:           logger,
          onEnterState:           logger,
          onEnterA:               logger,
          onEnterB:               logger,
          onEnterC:               logger,
          onEnterD:               logger,
          onAfterTransition:      logger,
          onAfterStep:            logger,
          onAfterHistoryBack:     logger,
          onAfterHistoryForward:  logger
        },
        plugins: [
          StateMachineHistory
        ]
      })

  fsm.step()
  fsm.step()
  fsm.step()
  logger.clear()

  t.is(fsm.state, 'D')
  t.deepEqual(fsm.history, [ 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.future, [ ])

  fsm.historyBack()

  t.is(fsm.state, 'C')
  t.deepEqual(fsm.history, [ 'A', 'B', 'C' ])
  t.deepEqual(fsm.future, [ 'D' ])

  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition',  transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onBeforeHistoryBack', transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onLeaveState',        transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onLeaveD',            transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onTransition',        transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onEnterState',        transition: 'historyBack', from: 'D', to: 'C', current: 'C' },
    { event: 'onEnterC',            transition: 'historyBack', from: 'D', to: 'C', current: 'C' },
    { event: 'onAfterTransition',   transition: 'historyBack', from: 'D', to: 'C', current: 'C' },
    { event: 'onAfterHistoryBack',  transition: 'historyBack', from: 'D', to: 'C', current: 'C' }
  ])

  logger.clear()

  fsm.historyForward()

  t.is(fsm.state, 'D')
  t.deepEqual(fsm.history, [ 'A', 'B', 'C', 'D' ])
  t.deepEqual(fsm.future, [ ])

  t.deepEqual(logger.log, [
    { event: 'onBeforeTransition',     transition: 'historyForward', from: 'C', to: 'D', current: 'C' },
    { event: 'onBeforeHistoryForward', transition: 'historyForward', from: 'C', to: 'D', current: 'C' },
    { event: 'onLeaveState',           transition: 'historyForward', from: 'C', to: 'D', current: 'C' },
    { event: 'onLeaveC',               transition: 'historyForward', from: 'C', to: 'D', current: 'C' },
    { event: 'onTransition',           transition: 'historyForward', from: 'C', to: 'D', current: 'C' },
    { event: 'onEnterState',           transition: 'historyForward', from: 'C', to: 'D', current: 'D' },
    { event: 'onEnterD',               transition: 'historyForward', from: 'C', to: 'D', current: 'D' },
    { event: 'onAfterTransition',      transition: 'historyForward', from: 'C', to: 'D', current: 'D' },
    { event: 'onAfterHistoryForward',  transition: 'historyForward', from: 'C', to: 'D', current: 'D' }
  ])

})

//-------------------------------------------------------------------------------------------------

test('history can be used with a state machine factory', t => {

  var FSM = StateMachine.factory({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

  var a = new FSM(),
      b = new FSM();

  t.is(a.state, 'solid')
  t.is(b.state, 'solid')
  t.deepEqual(a.history, [ 'solid' ])
  t.deepEqual(b.history, [ 'solid' ])

  a.melt()
  a.vaporize()
  a.condense()
  a.freeze()

  t.is(a.state, 'solid')
  t.is(b.state, 'solid')
  t.deepEqual(a.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  t.deepEqual(b.history, [ 'solid' ])

  b.melt()
  b.freeze()

  t.is(a.state, 'solid')
  t.is(b.state, 'solid')

  t.deepEqual(a.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  t.deepEqual(b.history, [ 'solid', 'liquid', 'solid' ])

})

//-------------------------------------------------------------------------------------------------

test('history can be used with a singleton state machine applied to existing object', t => {

  var fsm = {
    name: 'jake'
  }

  StateMachine.apply(fsm, {
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

  t.is(fsm.name, 'jake')
  t.is(fsm.state, 'solid')
  t.deepEqual(fsm.history, [ 'solid' ])

  fsm.melt();
  t.is(fsm.state, 'liquid')
  t.deepEqual(fsm.history, [ 'solid', 'liquid' ])

  fsm.vaporize();
  t.is(fsm.state, 'gas')
  t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas' ])

  fsm.condense()
  t.is(fsm.state, 'liquid')
  t.deepEqual(fsm.history, [ 'solid', 'liquid', 'gas', 'liquid' ])

})

//-------------------------------------------------------------------------------------------------

test('history can be used with a state machine factory applied to existing class', t => {

  function FSM(name) {
    this.name = name
    this._fsm()
  }

  StateMachine.factory(FSM, {
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      StateMachineHistory
    ]
  })

  var a = new FSM('A'),
      b = new FSM('B');

  t.is(a.name, 'A')
  t.is(b.name, 'B')

  t.is(a.state, 'solid')
  t.is(b.state, 'solid')
  t.deepEqual(a.history, [ 'solid' ])
  t.deepEqual(b.history, [ 'solid' ])

  a.melt()
  a.vaporize()
  a.condense()
  a.freeze()

  t.is(a.state, 'solid')
  t.is(b.state, 'solid')
  t.deepEqual(a.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  t.deepEqual(b.history, [ 'solid' ])

  b.melt()
  b.freeze()

  t.is(a.state, 'solid')
  t.is(b.state, 'solid')

  t.deepEqual(a.history, [ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  t.deepEqual(b.history, [ 'solid', 'liquid', 'solid' ])

})

//-------------------------------------------------------------------------------------------------
