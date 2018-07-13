import test         from 'ava';
import StateMachine from '../src/app';
import visualize    from '../src/plugin/visualize';
import {PFXSTR,PFXOBJ} from './helpers/dotprefix';

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

test('clear dotPrefix (empty)', t => {
  var fsm = new StateMachine({
    dotPrefix: {},
    statedefs: [
      {name: "roger"},
      {name: "wilco"}
    ],
    transitions: [
      { name: 'affirm', from: 'roger', to: 'wilco' },
    ]
  });
  t.is(visualize(fsm),`digraph "fsm" {
  "roger";
  "wilco";
  "roger" -> "wilco" [ label=" affirm " ];
}`);
});

test('clear dotPrefix (null)', t => {
  var fsm = new StateMachine({
    dotPrefix: null,
    statedefs: [
      {name: "roger"},
      {name: "wilco"}
    ],
    transitions: [
      { name: 'affirm', from: 'roger', to: 'wilco' },
    ]
  });
  t.is(visualize(fsm),`digraph "fsm" {
  "roger";
  "wilco";
  "roger" -> "wilco" [ label=" affirm " ];
}`);
});


test('redefine dotPrefix', t => {
  var fsm = new StateMachine({
    dotPrefix: {
      node: { fillColor: 'red' }
    },
    statedefs: [
      {name: "roger"},
      {name: "wilco"}
    ],
    transitions: [
      { name: 'affirm', from: 'roger', to: 'wilco' },
    ]
  });
  t.is(visualize(fsm),`digraph "fsm" {
  node  [ fillColor="red" ];
  "roger";
  "wilco";
  "roger" -> "wilco" [ label=" affirm " ];
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
  t.is(error.message, 'Undefined states in transitions: "negative, positive"');
});

test('transition name contained in states', t => {
  var error = t.throws(function() { new StateMachine({
    statedefs: [
      {name: "roger"},
      {name: "wilco"}
    ],
    transitions: [
      { name: 'roger', from: 'roger', to: 'wilco' },
    ]
  })});
  t.is(error.message, 'Transition name same as state: "roger"');
});

test('transition name in states AND undefined state in transition', t => {
  var error = t.throws(function() { new StateMachine({
    statedefs: [
      {name: "roger"},
    ],
    transitions: [
      { name: 'roger', from: 'roger', to: 'negative' },
    ]
  })});
  t.is(error.message, 'Undefined states in transitions: "negative"\nTransition name same as state: "roger"');
});