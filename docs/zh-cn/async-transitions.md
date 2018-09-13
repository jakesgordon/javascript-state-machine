# 异步转换

在阅读本文之前，您应该先熟悉状态机[生命周期事件](lifecycle-events.md)。

有时，您需要在状态转换期间执行一些异步代码，并确保直到代码完成，才进入下一状态。

例如：希望逐渐淡化UI组件后改变状态，在动画完成前不要转换到下一个状态，在动画完成后转换到下一个状态。
你可以通过从任意[生命周期事件](lifecycle-events.md)中返回[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/._Objects/Promise)对象

从生命周期事件返回`Promise`将导致该转变的生命周期暂停。它可以通过解决`Promise`来继续，或者通过拒绝`Promise`来取消。

例如（使用jQuery的效果）：

```javascript
  var fsm = new StateMachine({

    init: 'menu',

    transitions: [
      { name: 'play', from: 'menu', to: 'game' },
      { name: 'quit', from: 'game', to: 'menu' }
    ],

    methods: {

      onEnterMenu: function() {
        return new Promise(function(resolve, reject) {
          $('#menu').fadeIn('fast', resolve)
        })
      },

      onEnterGame: function() {
        return new Promise(function(resolve, reject) {
          $('#game').fadeIn('fast', resolve)
        })
      },

      onLeaveMenu: function() {
        return new Promise(function(resolve, reject) {
          $('#menu').fadeOut('fast', resolve)
        })
      },

      onLeaveGame: function() {
        return new Promise(function(resolve, reject) {
          $('#game').fadeOut('fast', resolve)
        })
      }
    }

  })
```

> 确保你最终总是解决（或拒绝）你的`Promise`，否则状态机将永远停留在那个挂起的转换中。