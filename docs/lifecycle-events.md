# Lifecycle Events

In order to track or perform an action when a transition occurs, five
general-purpose lifecycle events can be observed:

  * `onBeforeTransition` - fired before any transition
  * `onLeaveState`       - fired when leaving any state
  * `onTransition`       - fired during any transition
  * `onEnterState`       - fired when entering any state
  * `onAfterTransition`  - fired after any transition

In addition to the general-purpose events, transitions can be observed
using your specific transition and state names:

  * `onBefore<TRANSITION>` - fired before a specific TRANSITION begins
  * `onLeave<STATE>`       - fired when leaving a specific STATE
  * `onEnter<STATE>`       - fired when entering a specific STATE
  * `onAfter<TRANSITION>`  - fired after a specific TRANSITION completes

For convenience, the 2 most useful events can be shortened:

  * `on<TRANSITION>` - convenience shorthand for `onAfter<TRANSITION>`
  * `on<STATE>`      - convenience shorthand for `onEnter<STATE>`

## Observing Lifecycle Events

Individual lifecycle events can be observed using an observer method:

```javascript
  fsm.observe('onStep', function() {
    console.log('stepped');
  });
```

Multiple events can be observed using an observer object:

```javascript
  fsm.observe({
    onStep: function() { console.log('stepped');         }
    onA:    function() { console.log('entered state A'); }
    onB:    function() { console.log('entered state B'); }
  });
```

A state machine always observes its own lifecycle events:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' }
    ],
    methods: {
      onStep: function() { console.log('stepped');         }
      onA:    function() { console.log('entered state A'); }
      onB:    function() { console.log('entered state B'); }
    }
  });
```

## Lifecycle Event Arguments

Observers will be passed a single argument containing a `lifecycle` object with the following attributes:

  * **transition** - the transition name
  * **from**       - the previous state
  * **to**         - the next state

In addition to the `lifecycle` argument, the observer will receive any arbitrary arguments passed
into the transition method

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'A', to: 'B' }
    ],
    methods: {
      onTransition: function(lifecycle, arg1, arg2) {
        console.log(lifecycle.transition); // 'step'
        console.log(lifecycle.from);       // 'A'
        console.log(lifecycle.to);         // 'B'
        console.log(arg1);                 // 42
        console.log(arg2);                 // 'hello'
      }
    }
  });

  fsm.step(42, 'hello');
```

## Lifecycle Event Names

Lifecycle event names always use standard javascipt camelCase, even if your transition and
state names do not:

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'do-with-dash',       from: 'has-dash',        to: 'has_underscore'   },
      { name: 'do_with_underscore', from: 'has_underscore',  to: 'alreadyCamelized' },
      { name: 'doAlreadyCamelized', from: 'alreadyCamelize', to: 'has-dash'         }
    ],
    methods: {
      onBeforeDoWithDash:         function() { /* ... */ },
      onBeforeDoWithUnderscore:   function() { /* ... */ },
      onBeforeDoAlreadyCamelized: function() { /* ... */ },
      onLeaveHasDash:             function() { /* ... */ },
      onLeaveHasUnderscore:       function() { /* ... */ },
      onLeaveAlreadyCamelized:    function() { /* ... */ },
      onEnterHasDash:             function() { /* ... */ },
      onEnterHasUnderscore:       function() { /* ... */ },
      onEnterAlreadyCamelized:    function() { /* ... */ },
      onAfterDoWithDash:          function() { /* ... */ },
      onAfterDoWithUnderscore:    function() { /* ... */ },
      onAfterDoAlreadyCamelized:  function() { /* ... */ }
    }
  });
```

# Lifecycle Events Listed in Order

To recap, the lifecycle of a transition occurs in the following order:

  * `onBeforeTransition`   - fired before any transition
  * `onBefore<TRANSITION>` - fired before a specific TRANSITION
  * `onLeaveState`         - fired when leaving any state
  * `onLeave<STATE>`       - fired when leaving a specific STATE
  * `onTransition`         - fired during any transition
  * `onEnterState`         - fired when entering any state
  * `onEnter<STATE>`       - fired when entering a specific STATE
  * `on<STATE>`            - convenience shorthand for `onEnter<STATE>`
  * `onAfterTransition`    - fired after any transition
  * `onAfter<TRANSITION>`  - fired after a specific TRANSITION
  * `on<TRANSITION>`       - convenience shorthand for `onAfter<TRANSITION>`

# Cancelling a Transition

Any observer can cancel a transition by explicitly returning `false` during any of the following
lifecycle events:

  * `onBeforeTransition`
  * `onBefore<TRANSITION>`
  * `onLeaveState`
  * `onLeave<STATE>`
  * `onTransition`

All subsequent lifecycle events will be cancelled and the state will remain unchanged.

