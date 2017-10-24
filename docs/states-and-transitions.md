# States and Transitions

![matter state machine](../examples/matter.png)

A state machine consists of a set of **states**, e.g:

  * solid
  * liquid
  * gas

.. and a set of **transitions**, e.g:

  * melt
  * freeze
  * vaporize
  * condense

```javascript
  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  });

  fsm.state;             // 'solid'
  fsm.melt();
  fsm.state;             // 'liquid'
  fsm.vaporize();
  fsm.state;             // 'gas'
```

## Multiple states for a transition

![wizard state machine](../examples/wizard.png)

If a transition is allowed `from` multiple states then declare the transitions with the same name:

```javascript
  { name: 'step',  from: 'A', to: 'B' },
  { name: 'step',  from: 'B', to: 'C' },
  { name: 'step',  from: 'C', to: 'D' }
```

If a transition with multiple `from` states always transitions `to` the same state, e.g:

```javascript
  { name: 'reset', from: 'B', to: 'A' },
  { name: 'reset', from: 'C', to: 'A' },
  { name: 'reset', from: 'D', to: 'A' }
```

... then it can be abbreviated using an array of `from` states:

```javascript
  { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A' }
```

Combining these into a single example:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',               to: 'B' },
      { name: 'step',  from: 'B',               to: 'C' },
      { name: 'step',  from: 'C',               to: 'D' },
      { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A' }
    ]
  })
```

This example will create an object with 2 transition methods:

  * `fsm.step()`
  * `fsm.reset()`

The `reset` transition will always end up in the `A` state, while the `step` transition
will end up in a state that is dependent on the current state.

## Wildcard Transitions

If a transition is appropriate from **any** state, then a wildcard '*' `from` state can be used:

```javascript
  var fsm = new StateMachine({
    transitions: [
      // ...
      { name: 'reset', from: '*', to: 'A' }
    ]
  });
```

## Conditional Transitions

A transition can choose the target state at run-time by providing a function as the `to` attribute:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: '*', to: function(n) { return increaseCharacter(this.state, n || 1) } }
    ]
  });

  fsm.state;      // A
  fsm.step();
  fsm.state;      // B
  fsm.step(5);
  fsm.state;      // G

  // helper method to perform (c = c + n) on the 1st character in str
  function increaseCharacter(str, n) {
    return String.fromCharCode(str.charCodeAt(0) + n);
  }
```

The `allStates` method will only include conditional states once they have been seen at run-time:

```javascript
  fsm.state;        // A
  fsm.allStates();  // [ 'A' ]
  fsm.step();
  fsm.state;        // B
  fsm.allStates();  // [ 'A', 'B' ]
  fsm.step(5);
  fsm.state;        // G
  fsm.allStates();  // [ 'A', 'B', 'G' ]
```

## GOTO - Changing State Without a Transition

You can use a conditional transition, combined with a wildcard `from`, to implement
arbitrary `goto` behavior:

```javascript
  var fsm = new StateMachine({
    init: 'A'
    transitions: [
      { name: 'step', from: 'A', to: 'B'                      },
      { name: 'step', from: 'B', to: 'C'                      },
      { name: 'step', from: 'C', to: 'D'                      },
      { name: 'goto', from: '*', to: function(s) { return s } }
    ]
  })

  fsm.state;     // 'A'
  fsm.goto('D');
  fsm.state;     // 'D'
```

A full set of [Lifecycle Events](lifecycle-events.md) still apply when using `goto`.

