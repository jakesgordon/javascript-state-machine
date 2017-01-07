# Error Handling

## Invalid Transitions

By default, if you try to fire a transition that is not allowed in the current state, the
state machine will throw an exception. If you prefer to handle the problem yourself, you can
define a custom `onInvalidTransition` handler:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A', to: 'B' },
      { name: 'reset', from: 'B', to: 'A' }
    ],
    methods: {
      onInvalidTransition: function(transition, from, to) {
        throw new Exception("transition not allowed from that state");
      }
    }
  });

  fsm.state;        // 'A'
  fsm.can('step');  // true
  fsm.can('reset'); // false

  fsm.reset();      //  <-- throws "transition not allowed from that state"
```

## Pending Transitions

By default, if you try to fire a transition during a [Lifecycle Event](lifecycle-events.md) for a
pending transition, the state machine will throw an exception. If you prefer to handle the problem
yourself, you can define a custom `onPendingTransition` handler:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' }
    ],
    methods: {
      onLeaveA: function() {
        this.step();    //  <-- uh oh, trying to transition from within a lifecycle event is not allowed
      },
      onPendingTransition: function(transition, from, to) {
        throw new Exception("transition already in progress");
      }
    }
  });

  fsm.state;       // 'A'
  fsm.can('step'), // true
  fsm.step();      //  <-- throws "transition already in progress"
```
