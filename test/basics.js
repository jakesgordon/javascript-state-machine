import test         from 'ava';
import StateMachine from '../src/app';

//-------------------------------------------------------------------------------------------------

test('version', t => {
  t.is(StateMachine.version, '3.0.1');
});

//-------------------------------------------------------------------------------------------------

test('state machine', t => {

  var fsm = new StateMachine({
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  })

  t.is(fsm.state, 'green')

  fsm.warn();  t.is(fsm.state, 'yellow')
  fsm.panic(); t.is(fsm.state, 'red')
  fsm.calm();  t.is(fsm.state, 'yellow')
  fsm.clear(); t.is(fsm.state, 'green')

});

//-----------------------------------------------------------------------------

test('state machine factory', t => {

  var Alarm = StateMachine.factory({
        init: 'green',
        transitions: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' },
          { name: 'clear', from: 'yellow', to: 'green'  }
        ]
      }),
      a = new Alarm(),
      b = new Alarm();

  t.is(a.state, 'green')
  t.is(b.state, 'green')

  a.warn();  t.is(a.state, 'yellow'); t.is(b.state, 'green')
  a.panic(); t.is(a.state, 'red');    t.is(b.state, 'green')
  a.calm();  t.is(a.state, 'yellow'); t.is(b.state, 'green')
  a.clear(); t.is(a.state, 'green');  t.is(b.state, 'green')

  b.warn();  t.is(a.state, 'green');  t.is(b.state, 'yellow')
  b.panic(); t.is(a.state, 'green');  t.is(b.state, 'red')
  b.calm();  t.is(a.state, 'green');  t.is(b.state, 'yellow')
  b.clear(); t.is(a.state, 'green');  t.is(b.state, 'green')

});

//-----------------------------------------------------------------------------

test('state machine - applied to existing object', t => {

  var obj = { name: 'alarm' }

  StateMachine.apply(obj, {
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  t.is(obj.name,  'alarm');
  t.is(obj.state, 'green');

  obj.warn();  t.is(obj.state, 'yellow')
  obj.panic(); t.is(obj.state, 'red')
  obj.calm();  t.is(obj.state, 'yellow')
  obj.clear(); t.is(obj.state, 'green')

});

//-----------------------------------------------------------------------------

test('state machine factory - applied to existing class', t => {

  function Alarm(name) {
    this.name = name
    this._fsm(); // manual step needed to construct this FSM instance
  }

  StateMachine.factory(Alarm, {
    init: 'green',
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  var a = new Alarm('A'),
      b = new Alarm('B');

  t.is(a.name, 'A')
  t.is(b.name, 'B')

  t.is(a.state, 'green')
  t.is(b.state, 'green')

  a.warn();  t.is(a.state, 'yellow'); t.is(b.state, 'green')
  a.panic(); t.is(a.state, 'red');    t.is(b.state, 'green')
  a.calm();  t.is(a.state, 'yellow'); t.is(b.state, 'green')
  a.clear(); t.is(a.state, 'green');  t.is(b.state, 'green')

  b.warn();  t.is(a.state, 'green'); t.is(b.state, 'yellow')
  b.panic(); t.is(a.state, 'green'); t.is(b.state, 'red')
  b.calm();  t.is(a.state, 'green'); t.is(b.state, 'yellow')
  b.clear(); t.is(a.state, 'green'); t.is(b.state, 'green')

});

//-----------------------------------------------------------------------------
