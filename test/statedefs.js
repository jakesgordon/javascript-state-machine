import test         from 'ava';
import StateMachine from '../src/app';
import visualize    from '../src/plugin/visualize';
import {PFXSTR,PFXOBJ} from './imports/dotprefix';

test('states defined', t => {
  var fsm = new StateMachine({
    init: 'green',
    statedefs: [
      { name: 'green' },
      { name: 'red' },
      { name: 'yellow' },
      { name: 'green' }
    ],
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  t.is(fsm.state, 'green');

  fsm.warn();  t.is(fsm.state, 'yellow');
  fsm.panic(); t.is(fsm.state, 'red');
  fsm.calm();  t.is(fsm.state, 'yellow');
  fsm.clear(); t.is(fsm.state, 'green');
          // all works as expected

});

test('states defined with dot', t => {
  var fsm = new StateMachine({
    init: 'green',
    statedefs: [
      { name: 'green', dot: { fillcolor: "green" } },
      { name: 'red' , dot: { fillcolor: "red" } },
      { name: 'yellow', dot: { fillcolor: "yellow"} },
      { name: 'green', dot: { fillcolor: "green", shape: "rect" } }
    ],
    transitions: [
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  }
    ]
  });

  t.is(visualize(fsm),`digraph "fsm" {
${PFXSTR}
  "green" [ fillcolor="green" ];
  "red" [ fillcolor="red" ];
  "yellow" [ fillcolor="yellow" ];
  "green" [ fillcolor="green", shape="rect" ];
  "green" -> "yellow" [ label=" warn " ];
  "yellow" -> "red" [ label=" panic " ];
  "red" -> "yellow" [ label=" calm " ];
  "yellow" -> "green" [ label=" clear " ];
}`);
});

test('transition uses undefined state', t => {
  var error = t.throws(function() { new StateMachine({
    statedefs: [
      {name: "roger"},
      {name: "wilco"}
    ],
    transitions: [
      { name: 'response', from: 'roger', to: 'negative' },
      { name: 'ack', from: 'positive', to: 'wilco' }
    ]
  })});
  console.log('Error message in error: ' + error.message);
  t.is(error.message, 'Undefined states in transitions: "negative, positive"');
});
