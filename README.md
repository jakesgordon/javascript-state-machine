Javascript Finite State Machine
===============================

This standalone javascript micro-framework provides a finite state machine for your pleasure.

 * You can find the [code here](https://github.com/jakesgordon/javascript-state-machine)
 * You can find a description here - (_coming soon_)
 * You can find a working demo here - (_coming soon_)

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
      state: 'green',
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

Multiple Transitions
====================

If an event should be available from multiple states, simply use an array in the event `from` argument:

    var fsm = StateMachine.create({
      state: 'green',
      events: [
        { name: 'warn',  from: ['green'],           to: 'yellow' },
        { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
        { name: 'calm',  from: ['red'],             to: 'yellow' },
        { name: 'clear', from: ['red', 'yellow'],   to: 'green'  }
    ]});

Hooks
=====

4 hooks are available if your object has methods using the following naming conventions:

 * onbefore**event** - fired before an event
 * onafter**event**  - fired after an event
 * onenter**state**  - fired when entering a state
 * onleave**state**  - fired when leaving a state

The order of the hooks should be as expected:

 * onbefore**event**
 * onleave**state**
 * onenter**state**
 * onafter**event**

For convenience, the 2 most useful hooks can be shortened:

 * on**event** - convenience shorthand for onafter**event**
 * on**state** - convenience shorthand for onenter**state**

Hooks can be added after the FSM is created:

    var fsm = StateMachine.create({
      state: 'green',
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

Alternatively, hooks can be added before the FSM is created (to be sure of including the
initial state transition), by turning an existing object into an FSM using the `target`
option:

    var fsm = {
      onpanic  : function() { alert('panic!'); },
      onclear  : function() { alert('all clear!'); },
      ongreen  : function() { document.body.className = 'green';  },
      onyellow : function() { document.body.className = 'yellow'; },
      onred    : function() { document.body.className = 'red';    }
    };

    StateMachine.create({
      target: fsm,
      state: 'green',
      events: [
        { name: 'warn',  from: 'green',  to: 'yellow' },
        { name: 'panic', from: 'yellow', to: 'red'    },
        { name: 'calm',  from: 'red',    to: 'yellow' },
        { name: 'clear', from: 'yellow', to: 'green'  },
    ]});


    fsm.panic()
    fsm.clear()
    ...

In this way, you can also turn all instances of a  _class_ into an FSM by applying
the state machine functionality in a constructor function, and adding your hooks
into the prototype:

    MyFSM = function() {         // my constructor function
      StateMachine.create({
        target: this,
        state: 'green',
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






