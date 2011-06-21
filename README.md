Javascript Finite State Machine
===============================

This standalone javascript micro-framework provides a finite state machine for your pleasure.

 * You can find the [code here](https://github.com/jakesgordon/javascript-state-machine)
 * You can find a [description here](http://codeincomplete.com/posts/2011/6/1/javascript_state_machine/)
 * You can find a [working demo here](http://codeincomplete.com/posts/2011/6/1/javascript_state_machine/example/)

New in version 1.2
==================

 * Allows the same event to transition to different states, depending on the current state

Download
========

You can download [state-machine.js](https://github.com/jakesgordon/javascript-state-machine/raw/master/state-machine.js),
or the [minified version](https://github.com/jakesgordon/javascript-state-machine/raw/master/state-machine.min.js)

Alternatively:

    git clone git@github.com:jakesgordon/javascript-state-machine


 * All code is in state-machine.js
 * Minified version provided in state-machine.min.js
 * No 3rd party library is required
 * Demo can be found in /index.html
 * QUnit tests can be found in /test/index.html

Usage
=====

Include `state-machine.min.js` in your application.

In its simplest form, create a standalone state machine using:

    var fsm = StateMachine.create({
      initial: 'green',
      events: [
        { name: 'warn',  from: 'green',  to: 'yellow' },
        { name: 'panic', from: 'yellow', to: 'red'    },
        { name: 'calm',  from: 'red',    to: 'yellow' },
        { name: 'clear', from: 'yellow', to: 'green'  }
    ]});

... will create an object with a method for each event:

 * fsm.warn()  - transition from 'green' to 'yellow'
 * fsm.panic() - transition from 'yellow' to 'red'
 * fsm.calm()  - transition from 'red' to 'yellow'
 * fsm.clear() - transition from 'yellow' to 'green'

along with the following members:

 * fsm.current   - contains the current state
 * fsm.is(s)     - return true if state `s` is the current state
 * fsm.can(e)    - return true if event `e` can be fired in the current state
 * fsm.cannot(e) - return true if event `e` cannot be fired in the current state

Hooks
=====

4 hooks are available if your object has methods using the following naming conventions:

 * onbefore**event** - fired before an event
 * onafter**event**  - fired after an event
 * onenter**state**  - fired when entering a state
 * onleave**state**  - fired when leaving a state

For convenience, the 2 most useful hooks can be shortened:

 * on**event** - convenience shorthand for onafter**event**
 * on**state** - convenience shorthand for onenter**state**

Hooks can be added after the FSM is created:

    var fsm = StateMachine.create({
      initial: 'green',
      events: [
        { name: 'warn',  from: 'green',  to: 'yellow' },
        { name: 'panic', from: 'yellow', to: 'red'    },
        { name: 'calm',  from: 'red',    to: 'yellow' },
        { name: 'clear', from: 'yellow', to: 'green'  }
    ]});

    fsm.onpanic  = function() { alert('panic!'); };
    fsm.onclear  = function() { alert('all clear!'); };
    fsm.ongreen  = function() { document.body.className = 'green';  };
    fsm.onyellow = function() { document.body.className = 'yellow'; };
    fsm.onred    = function() { document.body.className = 'red';    };

    fsm.panic()
    fsm.clear()
    ...

Multiple 'from' states for a single event
=========================================

If an event is allowed **from** multiple states, and always transitions **to** the same
state, then simply provide an array of states in the `from` attribute of an event:

    var fsm = StateMachine.create({
      initial: 'green',
      events: [
        { name: 'warn',  from: ['green'],           to: 'yellow' },
        { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
        { name: 'calm',  from: ['red'],             to: 'yellow' },
        { name: 'clear', from: ['red', 'yellow'],   to: 'green'  }
    ]});

Multiple 'to' states for a single event
=======================================

If an event is allowed **from** multiple states, but should transition **to** a different
state depending on the current state, then provide multiple event entries with
the same name:

    var fsm = StateMachine.create({
      initial: 'hungry',
      events: [
        { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
        { name: 'eat',  from: 'satisfied',                             to: 'full'      },
        { name: 'eat',  from: 'full',                                  to: 'sick'      },
        { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
    ]});

This example will create an object with 2 event methods:

 * fsm.eat()
 * fsm.rest()

The rest event will always transition to the `hungry` state, while the eat event will transition to a state that is dependent on the current state.

State Machine Classes
=====================

You can also turn all instances of a  _class_ into an FSM by applying
the state machine functionality in a constructor function using the `target`
option, and adding your hooks into the prototype:

    MyFSM = function() {         // my constructor function
      StateMachine.create({
        target: this,
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' },
          { name: 'clear', from: 'yellow', to: 'green'  }
        ]});

      // other constructor behavior

    };

    MyFSM.prototype = {

      onpanic: function() { alert('panic'); },
      onclear: function() { alert('all is clear'); },

      // other prototype methods

    };

This should be easy to adjust to fit your appropriate mechanism for object construction.

>> _NOTE: There may be performance implications if you use this last pattern on classes
   that are going to be instantiated hundreds of times. Since the current implementation
   will re-create the event firing methods over and over again on each instance instead
   of creating them only once on the prototype object

>> In this case, what we would need is a way to create the StateMachine on the prototype
   object and simply initialize this.current for each instance.

>> If there is enough demand I'll fix that in a future version.

Initialization Options
======================

How the state machine should initialize can depend on your application requirements, so
the library provides a number of simple options.

By default, if you dont specify any initial state, the state machine will be in the `'none'`
state and you would need to provide an event to take it out of this state:

    var fsm = StateMachine.create({
      events: [
        { name: 'startup', from: 'none',  to: 'green' },
        { name: 'panic',   from: 'green', to: 'red'   },
        { name: 'calm',    from: 'red',   to: 'green' },
    ]});
    alert(fsm.current); // "none"
    fsm.startup();
    alert(fsm.current); // "green"

If you specify the name of your initial event (as in all the earlier examples), then an
implicit `startup` event will be created for you and fired when the state machine is constructed.

    var fsm = StateMachine.create({
      initial: 'green',
      events: [
        { name: 'panic', from: 'green', to: 'red'   },
        { name: 'calm',  from: 'red',   to: 'green' },
    ]});
    alert(fsm.current); // "green"

If your object already has a `startup` method you can change the name of the initial event

    var fsm = StateMachine.create({
      initial: { state: 'green', event: 'init' },
      events: [
        { name: 'panic', from: 'green', to: 'red'   },
        { name: 'calm',  from: 'red',   to: 'green' },
    ]});
    alert(fsm.current); // "green"

Finally, if you want to wait to call the initial state transition event until a later date you
can `defer` it:

    var fsm = StateMachine.create({
      initial: { state: 'green', event: 'init', defer: true },
      events: [
        { name: 'panic', from: 'green', to: 'red'   },
        { name: 'calm',  from: 'red',   to: 'green' },
    ]});
    alert(fsm.current); // "none"
    fsm.init();
    alert(fsm.current); // "green"

Of course, we have now come full circle, this last example is pretty much functionally the
same as the first example in this section where you simply define your own startup event.

So you have a number of choices available to you when initializing your state machine.


License
=======

See [LICENSE](https://github.com/jakesgordon/javascript-state-machine/blob/master/LICENSE) file.

Contact
=======

If you have any ideas, feedback, requests or bug reports, you can reach me at
[jake@codeincomplete.com](mailto:jake@codeincomplete.com), or via
my website: [Code inComplete](http://codeincomplete.com/posts/2011/6/1/javascript_state_machine/)






