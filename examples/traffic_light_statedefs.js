var StateMachine = require('../src/app'),
    visualize    = require('../src/plugin/visualize');

var fsm = new StateMachine({
  statedefs: [
    {name: 'green', dot: {style: "filled", fillcolor: "green"}},
    {name: 'yellow', dot: {shape: "rect", style: "filled", fillcolor: "yellow"}},
    {name: 'red', dot: {style: "filled", fillcolor: "red"}}
  ],
  transitions: [
    { name: 'start', from: 'none',   to: 'green', dot: {color:'blue'}},
    { name: 'warn',  from: 'green',  to: 'yellow', dot: {color:'blue'}},
    { name: 'panic', from: 'green',  to: 'red', dot: {color:'red'}    },
    { name: 'panic', from: 'yellow', to: 'red', dot: {color:'red'}    },
    { name: 'calm',  from: 'red',    to: 'yellow', dot: {color:'blue'} },
    { name: 'clear', from: 'red',    to: 'green', dot: {color:'green'}  },
    { name: 'clear', from: 'yellow', to: 'green', dot: {color:'green'}  },
  ]
});

fsm.visualize = function() {
  return visualize(fsm, { name: 'Traffic_Light' });
}

module.exports = fsm;
