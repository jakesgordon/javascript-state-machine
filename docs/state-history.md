# Remembering State History

By default, a state machine only tracks its current state. If you wish to track the state history
you can extend the state machine with the `state-machine-history` plugin.

```javascript
  var StateMachineHistory = require('javascript-state-machine/lib/history')
```

```javascript

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ],
    plugins: [
      new StateMachineHistory()     //  <-- plugin enabled here
    ]
  })

  fsm.history;        // [ 'A' ]
  fsm.step();
  fsm.history;        // [ 'A', 'B' ]
  fsm.step();
  fsm.history;        // [ 'A', 'B', 'C' ]

  fsm.clearHistory();

  fsm.history;        // [ ]

```
## Traversing History

You can traverse back through history using the `historyBack` and `historyForward` methods:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ]
  })

  fsm.step();
  fsm.step();
  fsm.step();

  fsm.state;    //                  'D'
  fsm.history;  // [ 'A', 'B', 'C', 'D' ]

  fsm.historyBack();

  fsm.state;    //             'C'
  fsm.history;  // [ 'A', 'B', 'C' ]

  fsm.historyBack();

  fsm.state;    //        'B'
  fsm.history;  // [ 'A', 'B' ]

  fsm.historyForward();

  fsm.state;    // 'C'
  fsm.history;  // [ 'A', 'B', 'C' ]
```

You can test if history traversal is allowed using the following properties:

```javascript
  fsm.canHistoryBack;     // true/false
  fsm.canHistoryForward;  // true/false
```

A full set of [Lifecycle Events](lifecycle-events.md) will still apply when traversing history with
`historyBack` and `historyForward`.

## Limiting History

By default, the state machine history is unbounded and will continue to grow until cleared. You
can limit storage to only the last N states by configuring the plugin:

``` javascript
  var fsm = new StateMachine({
    plugins: [
      new StateMachineHistory({ max: 100 })      //  <-- plugin configuration
    ]
  })
```

## Customizing History

If the `history` terminology clashes with your existing state machine attributes or methods, you
can enable the plugin with a different name:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ],
    plugins: [
      new StateMachineHistory({ name: 'memory' })
    ]
  })

  fsm.step();
  fsm.step();

  fsm.memory;         // [ 'A', 'B', 'C' ]

  fsm.memoryBack();
  fsm.memory;         // [ 'A', 'B' ]

  fsm.memoryForward();
  fsm.memory;         // [ 'A', 'B', 'C' ]

  fsm.clearMemory();
  fsm.memory;         // [ ]
```

