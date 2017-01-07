import test         from 'ava'
import StateMachine from '../../src/app'
import visualize    from '../../src/plugin/visualize'

var dotcfg    = visualize.dotcfg, // converts FSM        to DOT CONFIG
    dotify    = visualize.dotify; // converts DOT CONFIG to DOT OUTPUT

//-------------------------------------------------------------------------------------------------

test('visualize state machine', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  t.is(visualize(fsm), `digraph "fsm" {
  "solid";
  "liquid";
  "gas";
  "solid" -> "liquid" [ label=" melt " ];
  "liquid" -> "solid" [ label=" freeze " ];
  "liquid" -> "gas" [ label=" vaporize " ];
  "gas" -> "liquid" [ label=" condense " ];
}`)
})

//-------------------------------------------------------------------------------------------------

test('visualize state machine factory', t => {

  var FSM = StateMachine.factory({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  t.is(visualize(FSM), `digraph "fsm" {
  "solid";
  "liquid";
  "gas";
  "solid" -> "liquid" [ label=" melt " ];
  "liquid" -> "solid" [ label=" freeze " ];
  "liquid" -> "gas" [ label=" vaporize " ];
  "gas" -> "liquid" [ label=" condense " ];
}`)
})

//-------------------------------------------------------------------------------------------------

test('visualize with custom .dot markup', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid', dot: { color: 'red',    headport: 'nw', tailport: 'ne' } },
      { name: 'freeze',   from: 'liquid', to: 'solid',  dot: { color: 'grey',  headport: 'se', tailport: 'sw' } },
      { name: 'vaporize', from: 'liquid', to: 'gas',    dot: { color: 'yellow', headport: 'nw', tailport: 'ne' } },
      { name: 'condense', from: 'gas',    to: 'liquid', dot: { color: 'brown',  headport: 'se', tailport: 'sw' } }
    ]
  })

  t.is(visualize(fsm, { name: 'matter', orientation: 'horizontal' }), `digraph "matter" {
  rankdir=LR;
  "solid";
  "liquid";
  "gas";
  "solid" -> "liquid" [ color="red" ; headport="nw" ; label=" melt " ; tailport="ne" ];
  "liquid" -> "solid" [ color="grey" ; headport="se" ; label=" freeze " ; tailport="sw" ];
  "liquid" -> "gas" [ color="yellow" ; headport="nw" ; label=" vaporize " ; tailport="ne" ];
  "gas" -> "liquid" [ color="brown" ; headport="se" ; label=" condense " ; tailport="sw" ];
}`)
})

//=================================================================================================
// TEST FSM => DOTCFG
//=================================================================================================

test('dotcfg simple state machine', t => {

  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  t.deepEqual(dotcfg(fsm), {
    states: [ 'solid', 'liquid', 'gas' ],
    transitions: [
      { from: 'solid',  to: 'liquid', label: ' melt '     },
      { from: 'liquid', to: 'solid',  label: ' freeze '   },
      { from: 'liquid', to: 'gas',    label: ' vaporize ' },
      { from: 'gas',    to: 'liquid', label: ' condense ' }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for state machine - optionally include :init transition', t => {

  var fsm = new StateMachine({
    init: { name: 'boot', from: 'booting', to: 'ready', dot: { color: 'red' } }
  })

  t.deepEqual(dotcfg(fsm, { init: false }), {
    states: [ 'ready' ]
  })

  t.deepEqual(dotcfg(fsm, { init: true }), {
    states: [ 'booting', 'ready' ],
    transitions: [
      { from: 'booting', to: 'ready', label: ' boot ', color: 'red' }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm with multiple transitions with same :name', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ]
  })

  t.deepEqual(dotcfg(fsm), {
    states: [ 'A', 'B', 'C', 'D' ],
    transitions: [
      { from: 'A', to: 'B', label: ' step ' },
      { from: 'B', to: 'C', label: ' step ' },
      { from: 'C', to: 'D', label: ' step ' }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm transition with multiple :from', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',          to: 'B' },
      { name: 'step',  from: 'B',          to: 'C' },
      { name: 'step',  from: 'C',          to: 'D' },
      { name: 'reset', from: [ 'A', 'B' ], to: 'A' }
    ]
  })

  t.deepEqual(dotcfg(fsm), {
    states: [ 'A', 'B', 'C', 'D' ],
    transitions: [
      { from: 'A', to: 'B', label: ' step '  },
      { from: 'B', to: 'C', label: ' step '  },
      { from: 'C', to: 'D', label: ' step '  },
      { from: 'A', to: 'A', label: ' reset ' },
      { from: 'B', to: 'A', label: ' reset ' }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm with wildcard/missing :from', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',   from: 'A',     to: 'B' },
      { name: 'step',   from: 'B',     to: 'C' },
      { name: 'step',   from: 'C',     to: 'D' },
      { name: 'reset',  from: '*',     to: 'A' },
      { name: 'finish', /* missing */  to: 'X' }
    ]
  })

  t.deepEqual(dotcfg(fsm), {
    states: [ 'A', 'B', 'C', 'D', 'X' ],
    transitions: [
      { from: 'A',    to: 'B', label: ' step '   },
      { from: 'B',    to: 'C', label: ' step '   },
      { from: 'C',    to: 'D', label: ' step '   },
      { from: 'none', to: 'A', label: ' reset '  },
      { from: 'A',    to: 'A', label: ' reset '  },
      { from: 'B',    to: 'A', label: ' reset '  },
      { from: 'C',    to: 'A', label: ' reset '  },
      { from: 'D',    to: 'A', label: ' reset '  },
      { from: 'X',    to: 'A', label: ' reset '  },
      { from: 'none', to: 'X', label: ' finish ' },
      { from: 'A',    to: 'X', label: ' finish ' },
      { from: 'B',    to: 'X', label: ' finish ' },
      { from: 'C',    to: 'X', label: ' finish ' },
      { from: 'D',    to: 'X', label: ' finish ' },
      { from: 'X',    to: 'X', label: ' finish ' }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm with wildcard/missing :to', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B'       },
      { name: 'step', from: 'B', to: 'C'       },
      { name: 'step', from: 'C', to: 'D'       },
      { name: 'stay', from: 'A', to: 'A'       },
      { name: 'stay', from: 'B', to: '*'       },
      { name: 'stay', from: 'C'  /* missing */ },
      { name: 'noop', from: '*', to: '*'       }
    ]
  })

  t.deepEqual(dotcfg(fsm), {
    states: [ 'A', 'B', 'C', 'D' ],
    transitions: [
      { from: 'A',    to: 'B',    label: ' step ' },
      { from: 'B',    to: 'C',    label: ' step ' },
      { from: 'C',    to: 'D',    label: ' step ' },
      { from: 'A',    to: 'A',    label: ' stay ' },
      { from: 'B',    to: 'B',    label: ' stay ' },
      { from: 'C',    to: 'C',    label: ' stay ' },
      { from: 'none', to: 'none', label: ' noop ' },
      { from: 'A',    to: 'A',    label: ' noop ' },
      { from: 'B',    to: 'B',    label: ' noop ' },
      { from: 'C',    to: 'C',    label: ' noop ' },
      { from: 'D',    to: 'D',    label: ' noop ' }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm - conditional transition is not displayed', t => {

  var fsm = new StateMachine({
        init: 'A',
        transitions: [
          { name: 'step', from: '*', to: function(n) { return this.skip(n) } },
        ],
        methods: {
          skip: function(amount) {
            var code = this.state.charCodeAt(0);
            return String.fromCharCode(code + (amount || 1));
          }
        }
      });

  t.deepEqual(dotcfg(fsm), {
    states: [ 'A' ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg with custom transition .dot edge markup', t => {

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B', dot: { color: "red",   headport: 'nw', tailport: 'ne', label: 'A2B' } },
      { name: 'step', from: 'B', to: 'C', dot: { color: "green", headport: 'sw', tailport: 'se', label: 'B2C' } }
    ]
  })

  t.deepEqual(dotcfg(fsm), {
    states: [ 'A', 'B', 'C' ],
    transitions: [
      { from: 'A', to: 'B', label: 'A2B',  color: "red",   headport: "nw", tailport: "ne" },
      { from: 'B', to: 'C', label: 'B2C',  color: "green", headport: "sw", tailport: "se" }
    ]
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg with custom name', t => {

  var fsm = new StateMachine();

  t.deepEqual(dotcfg(fsm, { name: 'bob' }), {
    name: 'bob',
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg with custom orientation', t => {

  var fsm = new StateMachine();

  t.deepEqual(dotcfg(fsm, { orientation: 'horizontal' }), {
    rankdir: 'LR',
  })

  t.deepEqual(dotcfg(fsm, { orientation: 'vertical' }), {
    rankdir: 'TB',
  })

})

//-------------------------------------------------------------------------------------------------

test('dotcfg for empty state machine', t => {

  var fsm = new StateMachine();

  t.deepEqual(dotcfg(fsm), {})

})

//=================================================================================================
// TEST DOTCFG => DOT OUTPUT
//=================================================================================================

test('dotify empty', t => {
  var expected = `digraph "fsm" {
}`
  t.is(dotify(),   expected)
  t.is(dotify({}), expected)
})

//-------------------------------------------------------------------------------------------------

test('dotify name', t => {
  t.is(dotify({ name: 'bob' }), `digraph "bob" {
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify rankdir', t => {
  t.is(dotify({ rankdir: 'LR' }), `digraph "fsm" {
  rankdir=LR;
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify states', t => {
  var states = [ 'A', 'B' ];
  t.is(dotify({ states: states }), `digraph "fsm" {
  "A";
  "B";
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify transitions', t => {
  var transitions = [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
  ];
  t.is(dotify({ transitions: transitions }), `digraph "fsm" {
  "A" -> "B";
  "B" -> "C";
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify transitions with labels', t => {
  var transitions = [
    { from: 'A', to: 'B', label: 'first'  },
    { from: 'B', to: 'C', label: 'second' }
  ];
  t.is(dotify({ transitions: transitions }), `digraph "fsm" {
  "A" -> "B" [ label="first" ];
  "B" -> "C" [ label="second" ];
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify transitions with custom .dot edge markup', t => {
  var transitions = [
    { from: 'A', to: 'B', label: 'first',  color: 'red',   headport: 'nw', tailport: 'ne' },
    { from: 'B', to: 'A', label: 'second', color: 'green', headport: 'se', tailport: 'sw' }
  ]
  t.is(dotify({ transitions: transitions }), `digraph "fsm" {
  "A" -> "B" [ color="red" ; headport="nw" ; label="first" ; tailport="ne" ];
  "B" -> "A" [ color="green" ; headport="se" ; label="second" ; tailport="sw" ];
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify kitchen sink', t => {
  var name = "my fsm",
      rankdir = "LR",
      states = [ 'none', 'solid', 'liquid', 'gas' ],
      transitions = [
        { from: 'none',   to: 'solid',  color: 'red',   label: 'init'     },
        { from: 'solid',  to: 'liquid', color: 'red',   label: 'melt'     },
        { from: 'liquid', to: 'solid',  color: 'green', label: 'freeze'   },
        { from: 'liquid', to: 'gas',    color: 'red',   label: 'vaporize' }, 
        { from: 'gas',    to: 'liquid', color: 'green', label: 'condense' }
      ];
  t.is(dotify({ name: name, rankdir: rankdir, states: states, transitions: transitions }), `digraph "my fsm" {
  rankdir=LR;
  "none";
  "solid";
  "liquid";
  "gas";
  "none" -> "solid" [ color="red" ; label="init" ];
  "solid" -> "liquid" [ color="red" ; label="melt" ];
  "liquid" -> "solid" [ color="green" ; label="freeze" ];
  "liquid" -> "gas" [ color="red" ; label="vaporize" ];
  "gas" -> "liquid" [ color="green" ; label="condense" ];
}`)
})

//=================================================================================================
