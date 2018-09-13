# 数据和函数

除了[状态和转换](states-and-transitions.md)，一个状态机也可以包含任意的数据和方法。

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

## 数据和状态机工厂

如果你想通过[状态机工厂](state-machine-factory.md)创建多个实例，那么`data`对象将会在多个实例之间共享，这可能不是你想要的。为确保每一个实例获得唯一的`data`你应该使用`data`函数代替。

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

> 注意: 在构造每个实例时使用的参数直接传递到“data”函数。

