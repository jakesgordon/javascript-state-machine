# State Machine ES6

Most examples in this documentation construct a single state machine instance, for example:

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
```

If you wish to use State Machine Factory as a base class for your ES6 javascript class,
a State Machine ES6 class can be extended to do so:

```javascript
  class Matter extends StateMachine.es6 {
    static initialState = 'solid'
    static stateTransitions = [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ]
  }

  var a = new Matter(),    //  <-- instances are constructed here
      b = new Matter(),
      c = new Matter();

  b.melt();
  c.melt();
  c.vaporize();

  a.state;    // solid
  b.state;    // liquid
  c.state;    // gas
```

## State Machine Methods

You can define your state methods directly on your class!

```javascript
  class Matter extends StateMachine.es6 {
      static initialState = 'solid'
      static stateTransitions = [
        { name: 'melt',     from: 'solid',  to: 'liquid' },
        { name: 'freeze',   from: 'liquid', to: 'solid'  },
      ]
      onMelt() {
        console.log('I\'m melting!');
      }
      onFreeze() {
        console.log('Brr, it\'s cold');
      }
    }
```

> Be careful about overriding state machine methods and properties

## Assignment Transition

Because we can take advantage of es6 setters, we can attempt to perform a state transition by
applying state assignments.

```javascript
  class Matter extends StateMachine.es6 {
    static initialState = 'solid'
    static stateTransitions = [
      { name: 'melt',      from: 'solid',  to: 'liquid' },
      { name: 'freeze',    from: 'liquid', to: 'solid'  },
      { name: 'evaporate', from: 'liquid', to: 'gas'  },
    ]
    onMelt() {
      console.log('there I go melting again')
    }
  }

  var a = new Matter()

  a.state = 'gas'
  // throws error - cannot transition from solid to gas

  a.state = 'liquid'
  // console "there I go melting again"

  a.state = 'liquid'
  // nothing happens - already liquid
```
