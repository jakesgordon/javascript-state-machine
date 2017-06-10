# State Machine Factory

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

If you wish to construct multiple instances using the same configuration you should use a State
Machine Factory. A State Machine Factory provides a javascript constructor function (e.g. a 'class')
that can be instantiated multiple times:

```javascript
  var Matter = StateMachine.factory({     //  <-- the factory is constructed here
      init: 'solid',
      transitions: [
        { name: 'melt',     from: 'solid',  to: 'liquid' },
        { name: 'freeze',   from: 'liquid', to: 'solid'  },
        { name: 'vaporize', from: 'liquid', to: 'gas'    },
        { name: 'condense', from: 'gas',    to: 'liquid' }
      ]
  });

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

Using the factory, each state machine instance is a unique javascript object. Each instance manages
its own `state` property, but methods are shared via the normal javascript prototype mechanism.

> NOTE: be aware of special case handling required for [Data and State Machine Factories](data-and-methods.md#data-and-state-machine-factories)
 
## Applying State Machine Behavior to Existing Objects

Occasionally, you may wish to apply state machine behavior to an already existing
object (e.g. a react component). You can achieve this using the `StateMachine.apply` method:

```javascript
  var component = { /* ... */ };

  StateMachine.apply(component, {
    init: 'A',
    transitions: {
      { name: 'step', from: 'A', to: 'B' }
    }
  });
```

> Be careful not to use state or transition names that will clash with existing object properties.

## Applying State Machine Factory Behavior to Existing Classes

You can also apply state machine factory behavior to an existing class, however you must now
take responsibility for initialization by calling `this._fsm()` from within your class
constructor method:

```javascript
  function Person(name) {
    this.name = name;
    this._fsm(); //  <-- IMPORTANT
  }

  Person.prototype = {
    speak: function() {
      console.log('my name is ' + this.name + ' and I am ' + this.state);
    }
  }

  StateMachine.factory(Person, {
    init: 'idle',
    transitions: {
      { name: 'sleep', from: 'idle',     to: 'sleeping' },
      { name: 'wake',  from: 'sleeping', to: 'idle'     }
    }
  });

  var amy = new Person('amy'),
      bob = new Person('bob');

  bob.sleep();

  amy.state;   // 'idle'
  bob.state;   // 'sleeping'

  amy.speak(); // 'my name is amy and I am idle'
  bob.speak(); // 'my name is bob and I am sleeping'
```
