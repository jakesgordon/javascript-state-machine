# Initialization Options

## Explicit Init Transition

By default, if you don't specify an initial state, the state machine will be in the `none`
state, no lifecycle events will fire during construction, and you will need to provide an
explicit transition to advance out of this state:

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'init', from: 'none', to: 'A' },
      { name: 'step', from: 'A',    to: 'B' },
      { name: 'step', from: 'B',    to: 'C' }
    ]
  });
  fsm.state;    // 'none'
  fsm.init();   // 'init()' transition is fired explicitly
  fsm.state;    // 'A'
```

## Implicit Init Transition

If you specify the name of your initial state (as in most of the examples in this documentation),
then an implicit `init` transition will be created for you and fired (along with appropriate
lifecycle events) when the state machine is constructed.

> This is the most common initialization strategy, and the one you should use 90% of the time

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' }
    ]
  });           // 'init()' transition fires from 'none' to 'A' during construction
  fsm.state;    // 'A'
```

## Initialization and State Machine Factories

For [State Machine Factories](state-machine-factory.md), the `init` transition
is triggered for each constructed instance.

```javascript
  var FSM = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' }
    ]
  });

  var fsm1 = new FSM(),   // 'init()' transition fires from 'none' to 'A' for fsm1
      fsm2 = new FSM();   // 'init()' transition fires from 'none' to 'A' for fsm2
```
