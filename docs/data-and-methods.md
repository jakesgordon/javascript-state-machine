# Data and Methods

In addition to [States](states-and-transitions.md) and [Transitions](states-and-transitions.md), a state machine can
also contain arbitrary data and methods:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' }
    ],
    data: {
      color: 'red'
    },
    methods: {
      describe: function() {
        console.log('I am ' + this.color);
      }
    }
  });

  fsm.state;      // 'A'
  fsm.color;      // 'red'
  fsm.describe(); // 'I am red'
```

## Data and State Machine Factories

If you are constructing multiple instances from a [State Machine Factory](state-machine-factory.md) then the
`data` object will be shared amongst them. This is almost certainly **NOT** what you want! To
ensure that each instance gets unique data you should use a `data` method instead:

```javascript
  var FSM = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' }
    ],
    data: function(color) {      //  <-- use a method that can be called for each instance
      return {
        color: color
      }
    },
    methods: {
      describe: function() {
        console.log('I am ' + this.color);
      }
    }
  });

  var a = new FSM('red'),
      b = new FSM('blue');

  a.state; // 'A'
  b.state; // 'A'

  a.color; // 'red'
  b.color; // 'blue'

  a.describe(); // 'I am red'
  b.describe(); // 'I am blue'
```

> NOTE: that arguments used when constructing each instance are passed thru to the `data` method directly.
