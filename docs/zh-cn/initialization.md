# 初始化选项

## 显式初始化

默认情况下，如果你不特别的初始化状态，状态机将会处于`none`状态，在创建期间没有生命周期事件触发，并且你需要提供一个显示转换来跳出这个状态。

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'init', from: 'none', to: 'A' },
      { name: 'step', from: 'A',    to: 'B' },
      { name: 'step', from: 'B',    to: 'C' }
    ]
  });
  fsm.state;    // 'none'
  fsm.init();   // 'init()' transition is fired explicitly
  fsm.state;    // 'A'
```

## 隐式初始化

如果你指定初始状态的名称，那么将会在创建状态机的时候创建隐式的转换并触发(还会触发响应的生命周期事件)

>这是最常见的初始化策略，绝大多数(90%)时候你应该使用这个方法。

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' }
    ]
  });           // 'init()' transition fires from 'none' to 'A' during construction
  fsm.state;    // 'A'
```

## 用状态机工厂初始化

For [State Machine Factories](state-machine-factory.md), the `init` transition
is triggered for each constructed instance.

 [State Machine Factories状态机工厂](state-machine-factory.md),为每个状态机触发初始化转换。

```javascript
  var FSM = StateMachine.factory({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' }
    ]
  });

  var fsm1 = new FSM(),   // 'init()' transition fires from 'none' to 'A' for fsm1
      fsm2 = new FSM();   // 'init()' transition fires from 'none' to 'A' for fsm2
```
