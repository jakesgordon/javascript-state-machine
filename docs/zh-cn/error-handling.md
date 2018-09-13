# 错误处理

## 无效转换

默认情况下，如果尝试触发当前状态中不允许的转换，则状态机将引发异常。如果您喜欢自己处理这个问题，可以定义一个自定义的“onInvalidTransition”处理程序：

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step',  from: 'A', to: 'B' },
      { name: 'reset', from: 'B', to: 'A' }
    ],
    methods: {
      onInvalidTransition: function(transition, from, to) {
        throw new Exception("transition not allowed from that state");
      }
    }
  });

  fsm.state;        // 'A'
  fsm.can('step');  // true
  fsm.can('reset'); // false

  fsm.reset();      //  <-- throws "transition not allowed from that state"
```

## 悬而未决的转换

默认情况下，如果在[Lifecycle Event生命周期事件]（lifecycle-events.md）期间为挂起的转换尝试触发其他转换，则状态机将抛出异常。如果你喜欢自己处理这个问题，你可以定义一个自定义的“onPendingTransition”处理程序：

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' },
      { name: 'step', from: 'B', to: 'C' }
    ],
    methods: {
      onLeaveA: function() {
        this.step();    //  <-- uh oh, trying to transition from within a lifecycle event is not allowed
      },
      onPendingTransition: function(transition, from, to) {
        throw new Exception("transition already in progress");
      }
    }
  });

  fsm.state;       // 'A'
  fsm.can('step'), // true
  fsm.step();      //  <-- throws "transition already in progress"
```
