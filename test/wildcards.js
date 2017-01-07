import test         from 'ava'
import StateMachine from '../src/app'

//-----------------------------------------------------------------------------

test('wildcard :from allows transition from any state', t => {

  var fsm = new StateMachine({
    init: 'stopped',
    transitions: [
      { name: 'prepare', from: 'stopped',      to: 'ready'   },
      { name: 'start',   from: 'ready',        to: 'running' },
      { name: 'resume',  from: 'paused',       to: 'running' },
      { name: 'pause',   from: 'running',      to: 'paused'  },
      { name: 'stop',    from: '*',            to: 'stopped' }
  ]});

  t.is(fsm.state, 'stopped', "initial state should be stopped");

  fsm.prepare(); t.is(fsm.state, 'ready')
  fsm.stop();    t.is(fsm.state, 'stopped')

  fsm.prepare(); t.is(fsm.state, 'ready')
  fsm.start();   t.is(fsm.state, 'running')
  fsm.stop();    t.is(fsm.state, 'stopped')

  fsm.prepare(); t.is(fsm.state, 'ready')
  fsm.start();   t.is(fsm.state, 'running')
  fsm.pause();   t.is(fsm.state, 'paused')
  fsm.stop();    t.is(fsm.state, 'stopped')
  fsm.stop();    t.is(fsm.state, 'stopped')

                 t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure wildcard transition (stop) is included in available transitions")
  fsm.prepare(); t.deepEqual(fsm.transitions(), ["start",   "stop"], "ensure wildcard transition (stop) is included in available transitions")
  fsm.start();   t.deepEqual(fsm.transitions(), ["pause",   "stop"], "ensure wildcard transition (stop) is included in available transitions")
  fsm.stop();    t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure wildcard transition (stop) is included in available transitions")

})

//-----------------------------------------------------------------------------

test('missing :from allows transition from any state', t => {

  var fsm = new StateMachine({
    init: 'stopped',
    transitions: [
      { name: 'prepare', from: 'stopped',      to: 'ready'   },
      { name: 'start',   from: 'ready',        to: 'running' },
      { name: 'resume',  from: 'paused',       to: 'running' },
      { name: 'pause',   from: 'running',      to: 'paused'  },
      { name: 'stop',    /* any from state */  to: 'stopped' }
  ]});

  t.is(fsm.state, 'stopped', "initial state should be stopped")

  fsm.prepare(); t.is(fsm.state, 'ready')
  fsm.stop();    t.is(fsm.state, 'stopped')

  fsm.prepare(); t.is(fsm.state, 'ready')
  fsm.start();   t.is(fsm.state, 'running')
  fsm.stop();    t.is(fsm.state, 'stopped')

  fsm.prepare(); t.is(fsm.state, 'ready')
  fsm.start();   t.is(fsm.state, 'running')
  fsm.pause();   t.is(fsm.state, 'paused')
  fsm.stop();    t.is(fsm.state, 'stopped')

                 t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure missing :from transition (stop) is included in available transitions")
  fsm.prepare(); t.deepEqual(fsm.transitions(), ["start",   "stop"], "ensure missing :from transition (stop) is included in available transitions")
  fsm.start();   t.deepEqual(fsm.transitions(), ["pause",   "stop"], "ensure missing :from transition (stop) is included in available transitions")
  fsm.stop();    t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure missing :from transition (stop) is included in available transitions")

})

//-----------------------------------------------------------------------------

test('wildcard :from allows transition to a state that is never declared in any other :from transition ', t => {

  var fsm = new StateMachine({
        transitions: [
          { name: 'step',  from: 'none', to: 'mystery'  }, // NOTE: 'mystery' is only ever declared in :to, never :from
          { name: 'other', from: '*',    to: 'complete' }
        ]
      });

  t.is(fsm.state, 'none')
  t.is(fsm.can('step'),  true)
  t.is(fsm.can('other'), true)

  fsm.step()

  t.is(fsm.state, 'mystery')
  t.is(fsm.can('step'), false)
  t.is(fsm.can('other'), true)

})

//-----------------------------------------------------------------------------

test('wildcard :to allows no-op transitions', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'stayA', from: 'A', to: '*' },
      { name: 'stayB', from: 'B', to: '*' },
      { name: 'noop',  from: '*', to: '*' },
      { name: 'step',  from: 'A', to: 'B' }
    ]
  });

  t.is(fsm.state, 'A')
  t.is(fsm.can('noop'),  true)
  t.is(fsm.can('step'),  true)
  t.is(fsm.can('stayA'), true)
  t.is(fsm.can('stayB'), false)

  fsm.stayA(); t.is(fsm.state, 'A')
  fsm.noop();  t.is(fsm.state, 'A')

  fsm.step();

  t.is(fsm.state, 'B')
  t.is(fsm.can('noop'),  true)
  t.is(fsm.can('step'),  false)
  t.is(fsm.can('stayA'), false)
  t.is(fsm.can('stayB'), true)

  fsm.stayB(); t.is(fsm.state, 'B')
  fsm.noop();  t.is(fsm.state, 'B')

})

//-----------------------------------------------------------------------------

test('missing :to allows no-op transitions', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'stayA', from: 'A'  /* no-op */ },
      { name: 'stayB', from: 'B'  /* no-op */ },
      { name: 'noop',  from: '*'  /* no-op */ },
      { name: 'step',  from: 'A', to: 'B'     }
    ]
  });

  t.is(fsm.state, 'A')
  t.is(fsm.can('noop'),  true)
  t.is(fsm.can('step'),  true)
  t.is(fsm.can('stayA'), true)
  t.is(fsm.can('stayB'), false)

  fsm.stayA(); t.is(fsm.state, 'A')
  fsm.noop();  t.is(fsm.state, 'A')

  fsm.step();

  t.is(fsm.state, 'B')
  t.is(fsm.can('noop'),  true)
  t.is(fsm.can('step'),  false)
  t.is(fsm.can('stayA'), false)
  t.is(fsm.can('stayB'), true)

  fsm.stayB(); t.is(fsm.state, 'B')
  fsm.noop();  t.is(fsm.state, 'B')

})

//-----------------------------------------------------------------------------

test('no-op transitions with multiple from states', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',        to: 'B' },
      { name: 'noop1', from: ['A', 'B']  /* no-op */ },
      { name: 'noop2', from: '*'         /* no-op */ },
      { name: 'noop3', from: ['A', 'B'], to: '*' },
      { name: 'noop4', from: '*',        to: '*' }
    ]
  });

  t.is(fsm.state, 'A')
  t.is(fsm.can('step'),  true)
  t.is(fsm.can('noop1'), true)
  t.is(fsm.can('noop2'), true)
  t.is(fsm.can('noop3'), true)
  t.is(fsm.can('noop4'), true)

  fsm.noop1(); t.is(fsm.state, 'A')
  fsm.noop2(); t.is(fsm.state, 'A')
  fsm.noop3(); t.is(fsm.state, 'A')
  fsm.noop4(); t.is(fsm.state, 'A')

  fsm.step();
  t.is(fsm.state, 'B')
  t.is(fsm.can('step'), false)
  t.is(fsm.can('noop1'), true)
  t.is(fsm.can('noop2'), true)
  t.is(fsm.can('noop3'), true)
  t.is(fsm.can('noop4'), true)

  fsm.noop1(); t.is(fsm.state, 'B')
  fsm.noop2(); t.is(fsm.state, 'B')
  fsm.noop3(); t.is(fsm.state, 'B')
  fsm.noop4(); t.is(fsm.state, 'B')

})

//-----------------------------------------------------------------------------
