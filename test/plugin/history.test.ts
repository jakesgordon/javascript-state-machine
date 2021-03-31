import StateMachine        from '../../src/app/app'
import StateMachineHistory from '../../src/plugins/history'
import LifecycleLogger     from '../helpers/lifecycle_logger'

//-------------------------------------------------------------------------------------------------

test('history', () => {

  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('solid');  expect(fsm.history).toEqual([ 'solid' ]);
  fsm.melt();     expect(fsm.state).toBe('liquid'); expect(fsm.history).toEqual([ 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.state).toBe('gas');    expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])
  fsm.condense(); expect(fsm.state).toBe('liquid'); expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid' ]);

})

//-------------------------------------------------------------------------------------------------

test('history can be cleared', () => {

  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('B');
  expect(fsm.history).toEqual(['A', 'B']);

  fsm.clearHistory()

  expect(fsm.state).toBe('B');
  expect(fsm.history).toEqual([]);

})

//-------------------------------------------------------------------------------------------------

test('history does not record no-op transitions', () => {

  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('solid');  expect(fsm.history).toEqual([ 'solid' ]);
  fsm.noop();     expect(fsm.state).toBe('solid');  expect(fsm.history).toEqual([ 'solid' ])
  fsm.melt();     expect(fsm.state).toBe('liquid'); expect(fsm.history).toEqual([ 'solid', 'liquid' ])
  fsm.noop();     expect(fsm.state).toBe('liquid'); expect(fsm.history).toEqual([ 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.state).toBe('gas');    expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])
  fsm.noop();     expect(fsm.state).toBe('gas');    expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])

})

//-------------------------------------------------------------------------------------------------

test('history with configurable names', () => {

  const fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      // @ts-ignore
      new StateMachineHistory({ name: 'memory', future: 'yonder' })
    ]
  })

  expect(fsm.state).toBe('solid');  expect(fsm.memory).toEqual([ 'solid' ]);
  fsm.melt();     expect(fsm.state).toBe('liquid'); expect(fsm.memory).toEqual([ 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.state).toBe('gas');    expect(fsm.memory).toEqual([ 'solid', 'liquid', 'gas' ])
  fsm.condense(); expect(fsm.state).toBe('liquid'); expect(fsm.memory).toEqual([ 'solid', 'liquid', 'gas', 'liquid' ])

  expect(fsm.canMemoryBack).toBe(true)
  expect(fsm.canMemoryForward).toBe(false)
  expect(fsm.yonder).toEqual([ ])

  fsm.memoryBack()

  expect(fsm.state).toBe('gas')
  expect(fsm.memory).toEqual([ 'solid', 'liquid', 'gas' ])
  expect(fsm.yonder).toEqual([ 'liquid' ])

  fsm.clearMemory()
  expect(fsm.memory).toEqual([])
  expect(fsm.yonder).toEqual([])

})

//-------------------------------------------------------------------------------------------------

test('history, by default, just keeps growing', () => {

  const fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      // @ts-ignore
      new StateMachineHistory()
    ]
  })

  expect(fsm.state).toBe('solid')
  expect(fsm.history).toEqual([ 'solid' ])

  fsm.melt();     expect(fsm.history).toEqual([ 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])
  fsm.condense(); expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid' ])
  fsm.freeze();   expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  fsm.melt();     expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid', 'liquid', 'gas' ])

})

//-------------------------------------------------------------------------------------------------

test('history can be limited to N entries', () => {

  const fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    plugins: [
      // @ts-ignore
      new StateMachineHistory({ max: 3 })
    ]
  })

  expect(fsm.state).toBe('solid')
  expect(fsm.history).toEqual([ 'solid' ])

  fsm.melt();     expect(fsm.history).toEqual([ 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])
  fsm.condense(); expect(fsm.history).toEqual([ 'liquid', 'gas', 'liquid' ])
  fsm.freeze();   expect(fsm.history).toEqual([ 'gas', 'liquid', 'solid' ])
  fsm.melt();     expect(fsm.history).toEqual([ 'liquid', 'solid', 'liquid' ])
  fsm.vaporize(); expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])

})

//-------------------------------------------------------------------------------------------------

test('history back and forward', () => {

  const fsm = new StateMachine({
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

  expect(fsm.state).toBe('A')
  expect(fsm.canHistoryBack).toBe(false)
  expect(fsm.history).toEqual([ 'A' ])
  expect(fsm.future).toEqual([ ])

  try {
    fsm.historyBack()
  } catch (e) {
    expect(e.message).toBe('no history')
  }

  fsm.step()
  fsm.step()
  fsm.step()

  expect(fsm.state).toBe('D')
  expect(fsm.canHistoryBack).toBe(true)
  expect(fsm.canHistoryForward).toBe(false)
  expect(fsm.history).toEqual([ 'A', 'B', 'C', 'D' ])
  expect(fsm.future).toEqual([])

  fsm.historyBack()
  expect(fsm.state).toBe('C')
  expect(fsm.history).toEqual([ 'A', 'B', 'C' ])
  expect(fsm.future).toEqual([ 'D' ])
  expect(fsm.canHistoryBack).toBe(true)
  expect(fsm.canHistoryForward).toBe(true)

  fsm.historyBack()
  expect(fsm.state).toBe('B')
  expect(fsm.history).toEqual([ 'A', 'B' ])
  expect(fsm.future).toEqual([ 'D', 'C' ])
  expect(fsm.canHistoryBack).toBe(true)
  expect(fsm.canHistoryForward).toBe(true)

  fsm.historyBack()
  expect(fsm.state).toBe('A')
  expect(fsm.history).toEqual([ 'A' ])
  expect(fsm.future).toEqual([ 'D', 'C', 'B' ])
  expect(fsm.canHistoryBack).toBe(false)
  expect(fsm.canHistoryForward).toBe(true)

  fsm.historyForward()
  expect(fsm.state).toBe('B')
  expect(fsm.history).toEqual([ 'A', 'B' ])
  expect(fsm.future).toEqual([ 'D', 'C' ])
  expect(fsm.canHistoryBack).toBe(true)
  expect(fsm.canHistoryForward).toBe(true)

  fsm.historyForward()
  expect(fsm.state).toBe('C')
  expect(fsm.history).toEqual([ 'A', 'B', 'C' ])
  expect(fsm.future).toEqual([ 'D' ])
  expect(fsm.canHistoryBack).toBe(true)
  expect(fsm.canHistoryForward).toBe(true)

  fsm.step()
  expect(fsm.state).toBe('D')
  expect(fsm.history).toEqual([ 'A', 'B', 'C', 'D' ])
  expect(fsm.future).toEqual([ ])
  expect(fsm.canHistoryBack).toBe(true)
  expect(fsm.canHistoryForward).toBe(false)

  try {
    fsm.historyForward()
  } catch (e) {
    expect(e.message).toBe('no history');
  }

})

//-------------------------------------------------------------------------------------------------
test('history back and forward lifecycle events', () => {

  // @ts-ignore
  const logger = new LifecycleLogger(),
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

  expect(fsm.state).toBe('D')
  expect(fsm.history).toEqual([ 'A', 'B', 'C', 'D' ])
  expect(fsm.future).toEqual([ ])

  fsm.historyBack()

  expect(fsm.state).toBe('C')
  expect(fsm.history).toEqual([ 'A', 'B', 'C' ])
  expect(fsm.future).toEqual([ 'D' ])

  // console.log(logger.log);
  expect(logger.log).toEqual([
    { event: 'onBeforeTransition',  transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onBeforeHistoryBack', transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onLeaveState',        transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onLeaveD',            transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onTransition',        transition: 'historyBack', from: 'D', to: 'C', current: 'D' },
    { event: 'onEnterState',        transition: 'historyBack', from: 'D', to: 'C', current: 'C' },
    { event: 'onEnterC',            transition: 'historyBack', from: 'D', to: 'C', current: 'C' },
    { event: 'onAfterTransition',   transition: 'historyBack', from: 'D', to: 'C', current: 'C' },
    { event: 'onAfterHistoryBack',  transition: 'historyBack', from: 'D', to: 'C', current: 'C' }
  ]);

  logger.clear()

  fsm.historyForward()

  expect(fsm.state).toBe('D')
  expect(fsm.history).toEqual([ 'A', 'B', 'C', 'D' ])
  expect(fsm.future).toEqual([ ])

  expect(logger.log).toEqual([
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

test('history can be used with a state machine factory', () => {

  const FSM = StateMachine.factory({
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

  const a = new FSM(),
    b = new FSM();

  expect(a.state).toBe('solid')
  expect(b.state).toBe('solid')
  expect(a.history).toEqual([ 'solid' ])
  expect(b.history).toEqual([ 'solid' ])

  a.melt()
  a.vaporize()
  a.condense()
  a.freeze()

  expect(a.state).toBe('solid')
  expect(b.state).toBe('solid')
  expect(a.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  expect(b.history).toEqual([ 'solid' ])

  b.melt()
  b.freeze()

  expect(a.state).toBe('solid')
  expect(b.state).toBe('solid')

  expect(a.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  expect(b.history).toEqual([ 'solid', 'liquid', 'solid' ])

})

//-------------------------------------------------------------------------------------------------

test('history can be used with a singleton state machine applied to existing object', () => {

  let fsm = {
    name: 'jake'
  }

  // @ts-ignore
  fsm = StateMachine.apply(fsm, {
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

  expect(fsm.name).toBe('jake')
  // @ts-ignore
  expect(fsm.state).toBe('solid')
  // @ts-ignore
  expect(fsm.history).toEqual([ 'solid' ])

  // @ts-ignore
  fsm.melt();
  // @ts-ignore
  expect(fsm.state).toBe('liquid')
  // @ts-ignore
  expect(fsm.history).toEqual([ 'solid', 'liquid' ])

  // @ts-ignore
  fsm.vaporize();
  // @ts-ignore
  expect(fsm.state).toBe('gas')
  // @ts-ignore
  expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas' ])

  // @ts-ignore
  fsm.condense()
  // @ts-ignore
  expect(fsm.state).toBe('liquid')
  // @ts-ignore
  expect(fsm.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid' ])

})

//-------------------------------------------------------------------------------------------------

test('history can be used with a state machine factory applied to existing class', () => {

  function FSM(this, name) {
    this.name = name
    // this._fsm()
  }

  const FSM2 = StateMachine.factory(FSM, {
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

  const a = new FSM2('A'),
    b = new FSM2('B');

  expect(a.name).toBe('A')
  expect(b.name).toBe('B')

  expect(a.state).toBe('solid')
  expect(b.state).toBe('solid')
  expect(a.history).toEqual([ 'solid' ])
  expect(b.history).toEqual([ 'solid' ])

  a.melt()
  a.vaporize()
  a.condense()
  a.freeze()

  expect(a.state).toBe('solid')
  expect(b.state).toBe('solid')
  expect(a.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  expect(b.history).toEqual([ 'solid' ])

  b.melt()
  b.freeze()

  expect(a.state).toBe('solid')
  expect(b.state).toBe('solid')

  expect(a.history).toEqual([ 'solid', 'liquid', 'gas', 'liquid', 'solid' ])
  expect(b.history).toEqual([ 'solid', 'liquid', 'solid' ])

})