# Upgrading from Version 2.x

Version 3.0 is a significant rewrite from earlier versions in order to support more
advanced use cases and to improve the existing use cases. Unfortunately, many of these
updates are incompatible with earlier versions, so changes are required in your code when you upgrade
to version 3.x. We want to tackle those all in one swoop and avoid any more big-bang changes
in the future.

Please read this article carefully if you are upgrading from version 2.x to 3.x.

> A [summary](#upgrade-summary) of the changes required can be found at the end of the article.

### Table of Contents

  * [**Construction**](#construction) - constructing single instances follows a more idomatic javascript pattern.
  * [**State Machine Factory**](#state-machine-factory) - constructing multiple instances from a class has been simplified.
  * [**Data and Methods**](#data-and-methods) - A state machine can now have additional data and methods.
  * [**Renamed Terminology**](#renamed-terminology) - A more consistent terminology has been applied.
  * [**Lifecycle Events**](#lifecycle-events) - (previously called 'callbacks') are camelCased and observable.
  * [**Async Transitions**](#promise-based-asynchronous-transitions) - Asynchronous transitions now use standard Promises.
  * [**Conditional Transitions**](#conditional-transitions) - A transition can now dynamically choose its target state at run-time.
  * [**Goto**](#goto) - The state can be changed without a defined transition using `goto`.
  * [**State History**](#state-history) - The state history can now be retained and traversed with back/forward semantics.
  * [**Visualization**](#visualization) - A state machine can now be visualized using GraphViz.
  * [**Build System**](#build-system) - A new webpack-based build system has been implemented.

## Construction

Constructing a single state machine now follows a more idiomatic javascript pattern:

Version 2.x:

```javascript
  var fsm = StateMachine.create({ /* ... */ })
```

**Version 3.x**:

```javascript
  var fsm = new StateMachine({ /* ... */ })    //  <-- more idomatic 
```

## State Machine Factory

Constructing multiple instances from a state machine 'class' has been simplified:

Version 2.x:

```javascript
  function FSM() { }

  StateMachine.create({
    target: FSM.prototype,
    // ...
  })

  var a = new FSM(),
      b = new FSM();
```

**Version 3.x**:

```javascript
  var FSM = StateMachine.factory({ /* ... */ }),    //  <-- generate a factory (a constructor function)
      a   = new FSM(),                              //  <-- then create instances
      b   = new FSM();
```

## Data and Methods

A state machine can now have additional (arbitrary) data and methods defined:

Version 2.x: _not supported_.

**Version 3.x**:

```javascript
  var fsm = new StateMachine({
    data: {
      color: 'red'
    },
    methods: {
      speak: function() { console.log('hello') }
    }
  });

  fsm.color;   // 'red'
  fsm.speak(); // 'hello'
```

## Renamed Terminology

A more consistent terminology has been applied:

  * A state machine consists of a set of [**States**](states-and-transitions.md).
  * A state machine changes state by using [**Transitions**](states-and-transitions.md).
  * A state machine can perform actions during a transition by observing [**Lifecycle Events**](lifecycle-events.md).
  * A state machine can also have arbitrary [**Data and Methods**](data-and-methods.md).

Version 2.x:

```javascript
  var fsm = StateMachine.create({
    initial: 'ready',
    events:     [ /* ... */ ],
    callbacks:  { /* ... */ }
  });

  fsm.current;  // 'ready'
```

**Version 3.x**:

```javascript
  var fsm = new StateMachine({
    init:        'ready',             //  <-- renamed s/initial/init/
    transitions: [ /* ... */ ],       //  <-- renamed s/events/transitions/
    data:        { /* ... */ },       //  <-- new
    methods:     { /* ... */ }        //  <-- renamed s/callbacks/methods/
                                      //      ... which can contain arbitrary methods AND lifecycle event callbacks
  });

  fsm.state;  // 'ready'              //  <-- renamed s/current/state/
```

## Lifecycle Events

**Callbacks** have been renamed **Lifecycle Events** and are now declared as `methods` on the
state machine using a more traditional javascript camelCase for the method names:

Version 2.x:

```javascript
  var fsm = StateMachine.create({
    initial: 'initial-state',
    events: [
      { name: 'do-something', from: 'initial-state', to: 'final-state' }
    ],
    callbacks: {
      onbeforedosomething: function() { /* ... */ },
      onleaveinitialstate: function() { /* ... */ },
      onenterfinalstate:   function() { /* ... */ },
      onafterdosomething:  function() { /* ... */ }
    }
  })
```

**Version 3.x**:

```javascript
  var fsm = new StateMachine({
    init: 'initial-state',
    transitions: [
      { name: 'do-something', from: 'initial-state', to: 'final-state' }
    ],
    methods: {                                         //  <-- renamed s/callbacks/methods/
      onBeforeDoSomething: function() { /* ... */ },   //  <-- camelCase naming convention
      onLeaveInitialState: function() { /* ... */ },   //  <--
      onEnterFinalState:   function() { /* ... */ },   //  <--
      onAfterDoSomething:  function() { /* ... */ }    //  <--
    }
  })
```

<hr>
Lifecycle events are now passed information in a single `lifecycle` argument:

Version 2.x:

```javascript
  var fsm = StateMachine.create({
    events: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    callbacks: {
      onbeforestep: function(event, from, to) {
        console.log('event: ' + event);   // 'step'
        console.log('from: '  + from);    // 'none'
        console.log('to: '    + to);      // 'complete'
      },
    }
  });
```

**Version 3.x**:

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    methods: {
      onBeforeStep: function(lifecycle) {                   //  <-- combined into a single argument
        console.log('transition: ' + lifecycle.transition); //  'step'
        console.log('from: '       + lifecycle.from);       //  'none'
        console.log('to: '         + lifecycle.to);         //  'complete'
      }
    }
  });
```

> This change allows us to include additional information in the future without having to have a ridiculous
number of arguments to lifecycle event observer methods

<hr>
Lifecycle events are also now observable by others:
 
Version 2.x: _not supported_.

**Version 3.x**:

```javascript
  var fsm = new StateMachine({ /* ... */ });

  // observe individual lifecycle events with observer methods
  fsm.observe('onBeforeTransition', function() { /* ... */ });
  fsm.observe('onLeaveState',       function() { /* ... */ });

  // or observe multiple lifecycle events with an observer object
  fsm.observe({
    onBeforeTransition: function() { /* ... */ },
    onLeaveState:       function() { /* ... */ }
  });
```

<hr>
The general purpose lifecycle events now use the word `transition` instead of `event` and
occur **before** their specialized versions:

Version 2.x, the lifecycle order was:

  * `onbefore<EVENT>`
  * `onbeforeevent`
  * `onleave<STATE>`
  * `onleavestate`
  * `onenter<STATE>`
  * `onenterstate`
  * `on<STATE>`
  * `onafter<EVENT>`
  * `onafterevent`
  * `on<EVENT>`

**Version 3.x**, the lifecycle order is:

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

> For more details, read [Lifecycle Events](lifecycle-events.md)

## Promise-Based Asynchronous Transitions

Asynchronous transitions are now implemented using standard javascript [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

If you return a Promise from **any** lifecycle event then the entire lifecycle for that transition
is put on hold until that Promise gets resolved. If the promise is rejected then the transition
is cancelled.

Version 2.x:

```javascript
  var fsm = StateMachine.create({
    events: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    callbacks: {
      onbeforestep: function() {
        $('#ui').fadeOut('fast', function() {
          fsm.transition();
        });
        return StateMachine.ASYNC;
      }
    }
  });
```

**Version 3.x**:

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'none', to: 'complete' }
    ],
    methods: {
      onBeforeStep: function() {
        return new Promise(function(resolve, reject) {  //  <-- return a Promise instead of StateMachine.ASYNC
          $('#ui').fadeOut('fast', resolve);            //  <-- resolve the promise instead of calling .transition()
        });
      }
    }
  });
```

> For more details, read [Asynchronous Transitions](async-transitions.md)

## Conditional Transitions

A transition can now be conditional and choose the target state at run-time by providing a function
as the `to` attribute.

Version 2.x: _not supported_.

**Version 3.x**: See [Conditional Transitions](states-and-transitions.md#conditional-transitions)

## Goto

The state can now be changed without the need for a predefined transition using a conditional `goto`
transition:

Version 2.x: _not_supported_.

**Version 3.x**: See [Goto](states-and-transitions.md#goto---changing-state-without-a-transition)

## State History

A state machine can now track and traverse (back/forward) its state history.

Version 2.x: _not supported_.

**Version 3.x**: See [State History](state-history.md)

## Visualization

A state machine can now be visualized as a directed graph using GraphViz `.dot` syntax.

Version 2.x: _not_supported_.

**Version 3.x**: See [Visualization](visualization.md)

## Build System

A new [Webpack](https://webpack.js.org/concepts/) based build system has been provided along
with an [Ava](https://github.com/avajs/ava) based unit test suite.

Version 2.x: _not_supported_.

**Version 3.x**: See [Contributing](contributing.md)

## Other Breaking Changes in Version 3.0

`isFinished` is no longer built-in, you can easily add it to your state machine with a custom method:

```javascript
  var fsm = new StateMachine({
    methods: {
      isFinished: function() { return this.state === 'done' }
    }
  })
```

# UPGRADE SUMMARY

The following list summarizes the above changes you might need when upgrading to version 3.0

  * replace `StateMachine.create()` with `new StateMachine()`
  * rename:
    * `initial` to `init`
    * `events` to `transitions`
    * `callbacks` to `methods`
    * `fsm.current` to `fsm.state`
  * update your callback methods:
    * rename them to use traditional javascript `camelCasing`
    * refactor them to use the single `lifecycle` argument instead of individual `event,from,to` arguments
  * update any asynchronous callback methods:
    * return a `Promise` instead of `StateMachine.ASYNC`
    * `resolve()` the promise when ready instead of calling `fsm.transition()`
  * replace `StateMachine.create({ target: FOO })` with:
    * if FOO is a class - `StateMachine.factory(FOO, {})`
    * if FOO is an object - `StateMachine.apply(FOO, {})`

