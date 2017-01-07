# Visualization

It can be very helpful to visualize your state machine as a directed graph. This is possible
with the open source [GraphViz](http://www.graphviz.org/) library if we convert from our
state machine configuration to the `.dot` language expected by GraphViz using the
`visualize` method:

```javascript
  var visualize = require('javascript-state-machine/lib/visualize');

  var fsm = new StateMachine({
    init: 'open',
    transitions: [
      { name: 'close', from: 'open',   to: 'closed' },
      { name: 'open',  from: 'closed', to: 'open'   }
    ]
  });

  visualize(fsm)
```

Generates the following .dot syntax:

```dot
  digraph "fsm" {
    "closed";
    "open";
    "closed" -> "open" [ label=" open " ];
    "open" -> "closed" [ label=" close " ];
  }
```

Which GraphViz displays as:

![door](../examples/vertical_door.png)

## Enhanced Visualization

You can customize the generated `.dot` output - and hence the graphviz visualization - by attaching 
`dot` attributes to your transitions and (optionally) declaring an `orientation`:

```javascript
  var fsm = new StateMachine({
    init: 'closed',
    transitions: [
      { name: 'open',  from: 'closed', to: 'open',   dot: { color: 'blue', headport: 'n', tailport: 'n' } },
      { name: 'close', from: 'open',   to: 'closed', dot: { color: 'red',  headport: 's', tailport: 's' } }
    ]
  });
  visualize(fsm, { name: 'door', orientation: 'horizontal' });
```

Generates the following (enhanced) `.dot` syntax:

```dot
  digraph "door" {
    rankdir=LR;
    "closed";
    "open";
    "closed" -> "open" [ color="blue" ; headport="n" ; label=" open " ; tailport="n" ];
    "open" -> "closed" [ color="red" ; headport="s" ; label=" close " ; tailport="s" ];
  }
```

Which GraphViz displays as:

![door](../examples/horizontal_door.png)

## Visualizing State Machine Factories

You can use the same `visualize` method to generate `.dot` output for a state machine factory:

```javascript
  var Matter = StateMachine.factory({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid', dot: { headport: 'nw' } },
      { name: 'freeze',   from: 'liquid', to: 'solid',  dot: { headport: 'se' } },
      { name: 'vaporize', from: 'liquid', to: 'gas',    dot: { headport: 'nw' } },
      { name: 'condense', from: 'gas',    to: 'liquid', dot: { headport: 'se' } }
    ]
  });

  visualize(Matter, { name: 'matter', orientation: 'horizontal' })
```

Generates the following .dot syntax:

```dot
  digraph "matter" {
    rankdir=LR;
    "solid";
    "liquid";
    "gas";
    "solid" -> "liquid" [ headport="nw" ; label=" melt " ];
    "liquid" -> "solid" [ headport="se" ; label=" freeze " ];
    "liquid" -> "gas" [ headport="nw" ; label=" vaporize " ];
    "gas" -> "liquid" [ headport="se" ; label=" condense " ];
  }
```

Which GraphViz displays as:

![matter](../examples/matter.png)

## Other Examples

```javascript
  var Wizard = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',               to: 'B', dot: { headport: 'w',  tailport: 'ne' } },
      { name: 'step',  from: 'B',               to: 'C', dot: { headport: 'w',  tailport: 'e' } },
      { name: 'step',  from: 'C',               to: 'D', dot: { headport: 'w',  tailport: 'e' } },
      { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A', dot: { headport: 'se', tailport: 's' } }
    ]
  });

  visualize(Wizard, { orientation: 'horizontal' })
```

Generates:

```dot
  digraph "wizard" {
    rankdir=LR;
    "A";
    "B";
    "C";
    "D";
    "A" -> "B" [ headport="w" ; label=" step " ; tailport="ne" ];
    "B" -> "C" [ headport="w" ; label=" step " ; tailport="e" ];
    "C" -> "D" [ headport="w" ; label=" step " ; tailport="e" ];
    "B" -> "A" [ headport="se" ; label=" reset " ; tailport="s" ];
    "C" -> "A" [ headport="se" ; label=" reset " ; tailport="s" ];
    "D" -> "A" [ headport="se" ; label=" reset " ; tailport="s" ];
  }
```

Displays:

![wizard](../examples/wizard.png)

```javascript
  var ATM = StateMachine.factory({
    init: 'ready',
    transitions: [
      { name: 'insert-card', from: 'ready',              to: 'pin'                },
      { name: 'confirm',     from: 'pin',                to: 'action'             },
      { name: 'reject',      from: 'pin',                to: 'return-card'        },
      { name: 'withdraw',    from: 'return-card',        to: 'ready'              },

      { name: 'deposit',     from: 'action',             to: 'deposit-account'    },
      { name: 'provide',     from: 'deposit-account',    to: 'deposit-amount'     },
      { name: 'provide',     from: 'deposit-amount',     to: 'confirm-deposit'    },
      { name: 'confirm',     from: 'confirm-deposit',    to: 'collect-envelope'   },
      { name: 'provide',     from: 'collect-envelope',   to: 'continue'           },

      { name: 'withdraw',    from: 'action',             to: 'withdrawal-account' },
      { name: 'provide',     from: 'withdrawal-account', to: 'withdrawal-amount'  },
      { name: 'provide',     from: 'withdrawal-amount',  to: 'confirm-withdrawal' },
      { name: 'confirm',     from: 'confirm-withdrawal', to: 'dispense-cash'      },
      { name: 'withdraw',    from: 'dispense-cash',      to: 'continue'           },

      { name: 'continue',    from: 'continue',           to: 'action'             },
      { name: 'finish',      from: 'continue',           to: 'return-card'        }
    ]
  })

  visualize(ATM)
```

Generates:

```dot
  digraph "ATM" {
    "ready";
    "pin";
    "action";
    "return-card";
    "deposit-account";
    "deposit-amount";
    "confirm-deposit";
    "collect-envelope";
    "continue";
    "withdrawal-account";
    "withdrawal-amount";
    "confirm-withdrawal";
    "dispense-cash";
    "ready" -> "pin" [ label=" insert-card " ];
    "pin" -> "action" [ label=" confirm " ];
    "pin" -> "return-card" [ label=" reject " ];
    "return-card" -> "ready" [ label=" withdraw " ];
    "action" -> "deposit-account" [ label=" deposit " ];
    "deposit-account" -> "deposit-amount" [ label=" provide " ];
    "deposit-amount" -> "confirm-deposit" [ label=" provide " ];
    "confirm-deposit" -> "collect-envelope" [ label=" confirm " ];
    "collect-envelope" -> "continue" [ label=" provide " ];
    "action" -> "withdrawal-account" [ label=" withdraw " ];
    "withdrawal-account" -> "withdrawal-amount" [ label=" provide " ];
    "withdrawal-amount" -> "confirm-withdrawal" [ label=" provide " ];
    "confirm-withdrawal" -> "dispense-cash" [ label=" confirm " ];
    "dispense-cash" -> "continue" [ label=" withdraw " ];
    "continue" -> "action" [ label=" continue " ];
    "continue" -> "return-card" [ label=" finish " ];
  }
```

Displays:

![atm](../examples/atm.png)
