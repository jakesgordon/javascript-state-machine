# 状态机工厂

此文档中的大多数示例构造了单个状态机实例，例如：

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

如果你希望创建用相同的配置创建多个状态机，你应该使用状态机工厂。状态机工厂提供可以用来多次实例化的JS构造函数。

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

使用这个工厂，每一个状态机实例都有一个唯一的实例。每一个状态机管理他自己的`state`属性，但是方法是被通过JS原型机制(原型链)共享的。
 
> 注意:了解特殊案例处理需求 [Data and State Machine Factories数据和状态机工厂](data-and-methods.md#data-and-state-machine-factories)

## 应用状态机工厂行为到现有对象

有时，您可能希望将状态机行为应用到已经存在的对象（例如，反作用组件）。你可以用“StateMachine.apply”方法来实现这一点：

```javascript
  var component = { /* ... */ };

  StateMachine.apply(component, {
    init: 'A',
    transitions: {
      { name: 'step', from: 'A', to: 'B' }
    }
  });
```

> 小心的使用状态和转换名称，否则可能会和对象属性冲突。

## 应用状态机工厂行为到现有的类

还可以将状态机工厂行为应用于现有类，但是现在必须通过在类构造函数方法中调用`this._fsm()'来负责初始化：

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
