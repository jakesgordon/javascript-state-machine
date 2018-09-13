# 状态和转换

![matter state machine](../../examples/matter.png)

一个状态机由一组**States状态**组成, 例如:

  * solid
  * liquid
  * gas

.. 和一组**转换**, 例如:

  * melt
  * freeze
  * vaporize
  * condense

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

  fsm.state;             // 'solid'
  fsm.melt();
  fsm.state;             // 'liquid'
  fsm.vaporize();
  fsm.state;             // 'gas'
```

## 多种状态和转换

![wizard state machine](../../examples/wizard.png)

如果一个转换被允许`从`多种状态开始，那么用同一个名称定义这些转换。

```javascript
  { name: 'step',  from: 'A', to: 'B' },
  { name: 'step',  from: 'B', to: 'C' },
  { name: 'step',  from: 'C', to: 'D' }
```

如果一个转换是从多个不同的状态开始被转换到相同的状态，例如：

```javascript
  { name: 'reset', from: 'B', to: 'A' },
  { name: 'reset', from: 'C', to: 'A' },
  { name: 'reset', from: 'D', to: 'A' }
```

... 那么他可以被简写为从`数组`状态开始:

```javascript
  { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A' }
```

把他们组合到一起，例如:

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A',               to: 'B' },
      { name: 'step',  from: 'B',               to: 'C' },
      { name: 'step',  from: 'C',               to: 'D' },
      { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A' }
    ]
  })
```

这个例子将会创建一个有两个转换方法的对象:

  * `fsm.step()`
  * `fsm.reset()`

`reset`转换将总是转换到`A`状态, `step`转换的结果取决于当前的状态.

## 通配符转换

If a transition is appropriate from **any** state, then a wildcard '*' `from` state can be used:

如果一个转换可以从任意状态开始，那么可以使用通配符`*`。

```javascript
  var fsm = new StateMachine({
    transitions: [
      // ...
      { name: 'reset', from: '*', to: 'A' }
    ]
  });
```

## 条件转换

一个转换可以通过提供一个函数到`to`属性来在运行时选择目标状态。

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: '*', to: function(n) { return increaseCharacter(this.state, n || 1) } }
    ]
  });

  fsm.state;      // A
  fsm.step();
  fsm.state;      // B
  fsm.step(5);
  fsm.state;      // G

  // helper method to perform (c = c + n) on the 1st character in str
  function increaseCharacter(str, n) {
    return String.fromCharCode(str.charCodeAt(0) + n);
  }
```

`allStates`方法的返回列表只会包含运行时已经出现过的状态。

```javascript
  fsm.state;        // A
  fsm.allStates();  // [ 'A' ]
  fsm.step();
  fsm.state;        // B
  fsm.allStates();  // [ 'A', 'B' ]
  fsm.step(5);
  fsm.state;        // G
  fsm.allStates();  // [ 'A', 'B', 'G' ]
```

## 跳转 - `不通过转换改变状态`

你可以使用条件转换构造出一个`跳转`转换。

```javascript
  var fsm = new StateMachine({
    init: 'A'
    transitions: [
      { name: 'step', from: 'A', to: 'B'                      },
      { name: 'step', from: 'B', to: 'C'                      },
      { name: 'step', from: 'C', to: 'D'                      },
      { name: 'goto', from: '*', to: function(s) { return s } }
    ]
  })

  fsm.state;     // 'A'
  fsm.goto('D');
  fsm.state;     // 'D'
```

一组完整的[Lifecycle Events生命周期事件](lifecycle-events.md)仍旧在应用`goto`时可用.

