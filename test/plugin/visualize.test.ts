import StateMachine from '../../src/app/app'
import visualize  from '../../src/plugins/visualize'

const dotcfg    = visualize.dotcfg, // converts FSM        to DOT CONFIG
  dotify    = visualize.dotify; // converts DOT CONFIG to DOT OUTPUT

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

test('visualize state machine', () => {

  const fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  expect(visualize(fsm)).toBe(`digraph "fsm" {
  "solid";
  "liquid";
  "gas";
  "solid" -> "liquid" [ label=" melt " ];
  "liquid" -> "solid" [ label=" freeze " ];
  "liquid" -> "gas" [ label=" vaporize " ];
  "gas" -> "liquid" [ label=" condense " ];
}`);
});

//-------------------------------------------------------------------------------------------------

test('visualize state machine factory', () => {

  const FSM = StateMachine.factory({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  expect(visualize(new FSM())).toBe(`digraph "fsm" {
  "solid";
  "liquid";
  "gas";
  "solid" -> "liquid" [ label=" melt " ];
  "liquid" -> "solid" [ label=" freeze " ];
  "liquid" -> "gas" [ label=" vaporize " ];
  "gas" -> "liquid" [ label=" condense " ];
}`);
});

//-------------------------------------------------------------------------------------------------

test('visualize with custom .dot markup', () => {

  const fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid', dot: { color: 'red',    headport: 'nw', tailport: 'ne' } },
      { name: 'freeze',   from: 'liquid', to: 'solid',  dot: { color: 'grey',  headport: 'se', tailport: 'sw' } },
      { name: 'vaporize', from: 'liquid', to: 'gas',    dot: { color: 'yellow', headport: 'nw', tailport: 'ne' } },
      { name: 'condense', from: 'gas',    to: 'liquid', dot: { color: 'brown',  headport: 'se', tailport: 'sw' } }
    ]
  })

  expect(visualize(fsm, { name: 'matter', orientation: 'horizontal' })).toBe(`digraph "matter" {
  rankdir=LR;
  "solid";
  "liquid";
  "gas";
  "solid" -> "liquid" [ color="red" ; headport="nw" ; label=" melt " ; tailport="ne" ];
  "liquid" -> "solid" [ color="grey" ; headport="se" ; label=" freeze " ; tailport="sw" ];
  "liquid" -> "gas" [ color="yellow" ; headport="nw" ; label=" vaporize " ; tailport="ne" ];
  "gas" -> "liquid" [ color="brown" ; headport="se" ; label=" condense " ; tailport="sw" ];
}`);
});

//=================================================================================================
// TEST FSM => DOTCFG
//=================================================================================================

test('dotcfg simple state machine', () => {

  const fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  })

  expect(dotcfg(fsm)).toEqual({
    states: [ 'solid', 'liquid', 'gas' ],
    transitions: [
      { from: 'solid',  to: 'liquid', label: ' melt '     },
      { from: 'liquid', to: 'solid',  label: ' freeze '   },
      { from: 'liquid', to: 'gas',    label: ' vaporize ' },
      { from: 'gas',    to: 'liquid', label: ' condense ' }
    ]
  });
});

//-------------------------------------------------------------------------------------------------

test('dotcfg for state machine - optionally include :init transition', () => {

  const fsm = new StateMachine({
    init: { name: 'boot', from: 'booting', to: 'ready', dot: { color: 'red' } }
  });

  expect(dotcfg(fsm, { init: false })).toEqual({
    states: [ 'ready' ]
  });

  expect(dotcfg(fsm, { init: true })).toEqual({
    states: [ 'booting', 'ready' ],
    transitions: [
      { from: 'booting', to: 'ready', label: ' boot ', color: 'red' }
    ]
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm with multiple transitions with same :name', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ]
  })

  expect(dotcfg(fsm)).toEqual({
    states: [ 'A', 'B', 'C', 'D' ],
    transitions: [
      { from: 'A', to: 'B', label: ' step ' },
      { from: 'B', to: 'C', label: ' step ' },
      { from: 'C', to: 'D', label: ' step ' }
    ]
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm transition with multiple :from', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',          to: 'B' },
      { name: 'step',  from: 'B',          to: 'C' },
      { name: 'step',  from: 'C',          to: 'D' },
      { name: 'reset', from: [ 'A', 'B' ], to: 'A' }
    ]
  });

  expect(dotcfg(fsm)).toEqual({
    states: [ 'A', 'B', 'C', 'D' ],
    transitions: [
      { from: 'A', to: 'B', label: ' step '  },
      { from: 'B', to: 'C', label: ' step '  },
      { from: 'C', to: 'D', label: ' step '  },
      { from: 'A', to: 'A', label: ' reset ' },
      { from: 'B', to: 'A', label: ' reset ' }
    ]
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm with wildcard/missing :from', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',   from: 'A',     to: 'B' },
      { name: 'step',   from: 'B',     to: 'C' },
      { name: 'step',   from: 'C',     to: 'D' },
      { name: 'reset',  from: '*',     to: 'A' },
      { name: 'finish', /* missing */  to: 'X' }
    ]
  });

  expect(dotcfg(fsm)).toEqual({
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
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm with wildcard/missing :to', () => {

  const fsm = new StateMachine({
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
  });

  expect(dotcfg(fsm)).toEqual({
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
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg for fsm - conditional transition is not displayed', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      // @ts-ignore
      { name: 'step', from: '*', to: function(n) { return this.skip(n) } },
    ],
    methods: {
      skip: function(amount) {
        // @ts-ignore
        const code = this.state.charCodeAt(0);
        return String.fromCharCode(code + (amount || 1));
      }
    }
  });

  expect(dotcfg(fsm)).toEqual({
    states: [ 'A' ]
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg with custom transition .dot edge markup', () => {

  const fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B', dot: { color: "red",   headport: 'nw', tailport: 'ne', label: 'A2B' } },
      { name: 'step', from: 'B', to: 'C', dot: { color: "green", headport: 'sw', tailport: 'se', label: 'B2C' } }
    ]
  })

  expect(dotcfg(fsm)).toEqual({
    states: [ 'A', 'B', 'C' ],
    transitions: [
      { from: 'A', to: 'B', label: 'A2B',  color: "red",   headport: "nw", tailport: "ne" },
      { from: 'B', to: 'C', label: 'B2C',  color: "green", headport: "sw", tailport: "se" }
    ]
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg with custom name', () => {

  const fsm = new StateMachine();

  expect(dotcfg(fsm, { name: 'bob' })).toEqual({
    name: 'bob',
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg with custom orientation', () => {

  const fsm = new StateMachine();

  expect(dotcfg(fsm, { orientation: 'horizontal' })).toEqual({
    rankdir: 'LR',
  });

  expect(dotcfg(fsm, { orientation: 'vertical' })).toEqual({
    rankdir: 'TB',
  });

});

//-------------------------------------------------------------------------------------------------

test('dotcfg for empty state machine', () => {

  const fsm = new StateMachine();

  expect(dotcfg(fsm)).toEqual({});
});

//=================================================================================================
// TEST DOTCFG => DOT OUTPUT
//=================================================================================================

test('dotify empty', () => {
  const expected = `digraph "fsm" {
}`
  expect(dotify()).toBe(expected)
  expect(dotify({})).toBe(expected)
});

//-------------------------------------------------------------------------------------------------

test('dotify name', () => {
  expect(dotify({ name: 'bob' })).toBe(`digraph "bob" {
}`);
});

//-------------------------------------------------------------------------------------------------

test('dotify rankdir', () => {
  expect(dotify({ rankdir: 'LR' })).toBe(`digraph "fsm" {
  rankdir=LR;
}`);
});

//-------------------------------------------------------------------------------------------------

test('dotify states', () => {
  const states = [ 'A', 'B' ];
  expect(dotify({ states: states })).toBe(`digraph "fsm" {
  "A";
  "B";
}`);
});

//-------------------------------------------------------------------------------------------------

test('dotify transitions', () => {
  const transitions = [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
  ];
  expect(dotify({ transitions: transitions })).toBe(`digraph "fsm" {
  "A" -> "B";
  "B" -> "C";
}`)
})

//-------------------------------------------------------------------------------------------------

test('dotify transitions with labels', () => {
  const transitions = [
    { from: 'A', to: 'B', label: 'first'  },
    { from: 'B', to: 'C', label: 'second' }
  ];
  expect(dotify({ transitions: transitions })).toBe(`digraph "fsm" {
  "A" -> "B" [ label="first" ];
  "B" -> "C" [ label="second" ];
}`);
});

//-------------------------------------------------------------------------------------------------

test('dotify transitions with custom .dot edge markup', () => {
  const transitions = [
    { from: 'A', to: 'B', label: 'first',  color: 'red',   headport: 'nw', tailport: 'ne' },
    { from: 'B', to: 'A', label: 'second', color: 'green', headport: 'se', tailport: 'sw' }
  ]
  expect(dotify({ transitions: transitions })).toBe(`digraph "fsm" {
  "A" -> "B" [ color="red" ; headport="nw" ; label="first" ; tailport="ne" ];
  "B" -> "A" [ color="green" ; headport="se" ; label="second" ; tailport="sw" ];
}`);
})

//-------------------------------------------------------------------------------------------------

test('dotify kitchen sink', () => {
  const name = "my fsm",
    rankdir = "LR",
    states = [ 'none', 'solid', 'liquid', 'gas' ],
    transitions = [
      { from: 'none',   to: 'solid',  color: 'red',   label: 'init'     },
      { from: 'solid',  to: 'liquid', color: 'red',   label: 'melt'     },
      { from: 'liquid', to: 'solid',  color: 'green', label: 'freeze'   },
      { from: 'liquid', to: 'gas',    color: 'red',   label: 'vaporize' },
      { from: 'gas',    to: 'liquid', color: 'green', label: 'condense' }
    ];
  expect(dotify({ name: name, rankdir: rankdir, states: states, transitions: transitions })).toBe(`digraph "my fsm" {
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
}`);
});

//=================================================================================================