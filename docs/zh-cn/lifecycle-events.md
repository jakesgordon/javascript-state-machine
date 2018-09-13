# 生命周期事件

当转换发生时，为了追踪或执行某些动作，可以观察五个通用的生命周期事件：

  * `onBeforeTransition` - 转换之前调用
  * `onLeaveState`       - 离开一个状态时调用
  * `onTransition`       - 转换期间调用
  * `onEnterState`       - 进入一个状态时调用
  * `onAfterTransition`  - 转换之后调用

In addition to the general-purpose events, transitions can be observed
using your specific transition and state names:

除了通用事件之外，还可以使用特定的转换和状态名称来观察转换：

  * `onBefore<TRANSITION>` - 在一个特定的`TRANSITION`转换开始之前
  * `onLeave<STATE>`       - 在离开一个特定的`STATE`状态时调用
  * `onEnter<STATE>`       - 在进入一个特定的`STATE`状态时调用
  * `onAfter<TRANSITION>`  - 在一个特定的`TRANSITION`转换之后调用

为了便利起见,两个最有用的事件可以缩短为:

  * `on<TRANSITION>` - 等价于`onAfter<TRANSITION>`
  * `on<STATE>`      - 等价于`onEnter<STATE>`

## 观察生命周期事件

个体生命周期事件可以`observe()`方法观察到

```javascript
  fsm.observe('onStep', function() {
    console.log('stepped');
  });
```

可以使用观察者对象观察多个事件

```javascript
  fsm.observe({
    onStep: function() { console.log('stepped');         }
    onA:    function() { console.log('entered state A'); }
    onB:    function() { console.log('entered state B'); }
  });
```

一个状态机总是观察它自己的生命周期事件。

```javascript
  var fsm = new StateMachine({
    init: 'A',
    transitions: [
      { name: 'step', from: 'A', to: 'B' }
    ],
    methods: {
      onStep: function() { console.log('stepped');         }
      onA:    function() { console.log('entered state A'); }
      onB:    function() { console.log('entered state B'); }
    }
  });
```

## 生命周期事件参数

观察者将传递一个包含“生命周期”对象的单个参数，该属性具有以下属性

  * **transition** - 转换名称
  * **from**       - 先前的状态
  * **to**         - 接下来的状态

除了“生命周期”参数，观察者还将接收传递到转换方法中的其他参数。

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'step', from: 'A', to: 'B' }
    ],
    methods: {
      onTransition: function(lifecycle, arg1, arg2) {
        console.log(lifecycle.transition); // 'step'
        console.log(lifecycle.from);       // 'A'
        console.log(lifecycle.to);         // 'B'
        console.log(arg1);                 // 42
        console.log(arg2);                 // 'hello'
      }
    }
  });

  fsm.step(42, 'hello');
```

## 生命周期事件名称

Lifecycle event names always use standard javascipt camelCase, even if your transition and
state names do not:
生命周期事件名称总是使用标准的js驼峰命名法，即使你的转换和状态名称不是按照驼峰命名法命名的：

```javascript
  var fsm = new StateMachine({
    transitions: [
      { name: 'do-with-dash',       from: 'has-dash',        to: 'has_underscore'   },
      { name: 'do_with_underscore', from: 'has_underscore',  to: 'alreadyCamelized' },
      { name: 'doAlreadyCamelized', from: 'alreadyCamelize', to: 'has-dash'         }
    ],
    methods: {
      onBeforeDoWithDash:         function() { /* ... */ },
      onBeforeDoWithUnderscore:   function() { /* ... */ },
      onBeforeDoAlreadyCamelized: function() { /* ... */ },
      onLeaveHasDash:             function() { /* ... */ },
      onLeaveHasUnderscore:       function() { /* ... */ },
      onLeaveAlreadyCamelized:    function() { /* ... */ },
      onEnterHasDash:             function() { /* ... */ },
      onEnterHasUnderscore:       function() { /* ... */ },
      onEnterAlreadyCamelized:    function() { /* ... */ },
      onAfterDoWithDash:          function() { /* ... */ },
      onAfterDoWithUnderscore:    function() { /* ... */ },
      onAfterDoAlreadyCamelized:  function() { /* ... */ }
    }
  });
```

# 按顺序列出的生命周期事件

重申，转换生命周期按以下顺序发生：

  * `onBeforeTransition`   - fired before any transition
  * `onBefore<TRANSITION>` - fired before a specific TRANSITION
  * `onLeaveState`         - fired when leaving any state
  * `onLeave<STATE>`       - fired when leaving a specific STATE
  * `onTransition`         - fired during any transition
  * `onEnterState`         - fired when entering any state
  * `onEnter<STATE>`       - fired when entering a specific STATE
  * `on<STATE>`            - convenience shorthand for `onEnter<STATE>`
  * `onAfterTransition`    - fired after any transition
  * `onAfter<TRANSITION>`  - fired after a specific TRANSITION
  * `on<TRANSITION>`       - convenience shorthand for `onAfter<TRANSITION>`

# 取消转换

任何观察者可以通过在任何生命周期事件中显式地返回“false”来取消转换：

  * `onBeforeTransition`
  * `onBefore<TRANSITION>`
  * `onLeaveState`
  * `onLeave<STATE>`
  * `onTransition`

所有后续生命周期事件将被取消，状态将保持不变。

