# 状态历史

默认情况下，一个状态机只追踪当前状态，如果希望追踪状态历史，你可以用`state-machine-history`插件扩展状态机。

```javascript
  var StateMachineHistory = require('javascript-state-machine/lib/history')
```

```javascript

  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ],
    plugins: [
      new StateMachineHistory()     //  <-- plugin enabled here
    ]
  })

  fsm.history;        // [ 'A' ]
  fsm.step();
  fsm.history;        // [ 'A', 'B' ]
  fsm.step();
  fsm.history;        // [ 'A', 'B', 'C' ]

  fsm.clearHistory();

  fsm.history;        // [ ]

```
## 穿越历史

你可以使用`historyBack`和`historyForward`穿越历史。

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ]
  })

  fsm.step();
  fsm.step();
  fsm.step();

  fsm.state;    //                  'D'
  fsm.history;  // [ 'A', 'B', 'C', 'D' ]

  fsm.historyBack();

  fsm.state;    //             'C'
  fsm.history;  // [ 'A', 'B', 'C' ]

  fsm.historyBack();

  fsm.state;    //        'B'
  fsm.history;  // [ 'A', 'B' ]

  fsm.historyForward();

  fsm.state;    // 'C'
  fsm.history;  // [ 'A', 'B', 'C' ]
```

你可以使用下面方法测试穿越历史是否被允许:

```javascript
  fsm.canHistoryBack;     // true/false
  fsm.canHistoryForward;  // true/false
```

一组 [Lifecycle Events生命周期事件](lifecycle-events.md) 将仍旧在穿越历史时应用。

## 限制历史记录数量

默认情况下,状态机的历史知道被清除是无限增长的。你可以通过配置来限制只存储最后的N条状态。

``` javascript
  var fsm = new StateMachine({
    plugins: [
      new StateMachineHistory({ max: 100 })      //  <-- plugin configuration
    ]
  })
```

## 自定义历史

如果`history`和你存在的状态机属性或方法发生术语冲突，你可以用一个不同的名字打开`state-machine-history`插件。

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' },
      { name: 'step', from: 'C', to: 'D' }
    ],
    plugins: [
      new StateMachineHistory({ name: 'memory' })
    ]
  })

  fsm.step();
  fsm.step();

  fsm.memory;         // [ 'A', 'B', 'C' ]

  fsm.memoryBack();
  fsm.memory;         // [ 'A', 'B' ]

  fsm.memoryForward();
  fsm.memory;         // [ 'A', 'B', 'C' ]

  fsm.clearMemory();
  fsm.memory;         // [ ]
```

