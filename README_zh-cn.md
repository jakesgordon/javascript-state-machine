# Javascript State Machine

[![NPM version](https://badge.fury.io/js/javascript-state-machine.svg)](https://badge.fury.io/js/javascript-state-machine)
[![Build Status](https://travis-ci.org/jakesgordon/javascript-state-machine.svg?branch=master)](https://travis-ci.org/jakesgordon/javascript-state-machine)

一个有限状态机库.

![matter state machine](examples/matter.png)

<br>

### 现有用户注意

> 值得关注的是**VERSION 3.0** 已经重写了。
  现有2.x用户应该阅读[升级指南](docs/upgrading-from-v2.md).

<br>

# 安装

在浏览器中使用:

```html
  <script src='state-machine.js'></script>
```

> 在下载[js文件](dist/state-machine.js)或者[压缩版js文件](dist/state-machine.min.js)之后引用。

在Node中使用npm安装:

```shell
  npm install --save-dev javascript-state-machine
  or
  npm install --save javascript-state-machine
```

在Node的js文件中导入:

```javascript
  var StateMachine = require('javascript-state-machine');
```

# 用法

一个状态机可以这样构建:

```javascript
  var fsm = new StateMachine({
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    methods: {
      onMelt:     function() { console.log('I melted')    },
      onFreeze:   function() { console.log('I froze')     },
      onVaporize: function() { console.log('I vaporized') },
      onCondense: function() { console.log('I condensed') }
    }
  });
```

... 创建的对象上有包含当前状态的的属性:

  * `fsm.state`

... 创建的对象上有转换到不同状态的方法:

  * `fsm.melt()`
  * `fsm.freeze()`
  * `fsm.vaporize()`
  * `fsm.condense()`

... 观察方法在生命周期中自动被调用:

  * `onMelt()`
  * `onFreeze()`
  * `onVaporize()`
  * `onCondense()`

... 还有下面的帮助方法:

|方法|注释|
|---|---|
|fsm.is(s)|如果当前状态`s`是当前状态则返回true|
|fsm.can(t)|如果转换`t`在当前状态下`可以`发生则返回true|
|fsm.cannot(t)|如果转换`t`在当前状态下`不可以`发生则返回true|
|fsm.transitions()|返回当前状态下可以发生的转换的列表|
|fsm.allTransitions()|返回所有可以发生的转换的列表|
|fsm.allStates()|返回所有可以出现的状态的列表|

# 术语

一个状态机由一组[**States状态**](docs/states-and-transitions.md)组成

  * solid
  * liquid
  * gas

一个状态机可以通过[**Transitions转换**](docs/states-and-transitions.md)改变状态

  * melt
  * freeze
  * vaporize
  * condense

一个状态机在转换期间可以通过观察[**Lifecycle Events生命周期事件**](docs/lifecycle-events.md)执行操作

  * onBeforeMelt
  * onAfterMelt
  * onLeaveSolid
  * onEnterLiquid
  * ...

一个状态机可以有任意的[**Data 数据 and Methods 方法**](docs/data-and-methods.md).

多个状态机实例可以通过使用[**State Machine Factory**](docs/state-machine-factory.md)来创建.

# 文档

阅读更多有关的文档

  * [States and Transitions状态和转换](docs/zh-cn/states-and-transitions.md)
  * [Data and Methods数据和方法](docs/zh-cn/data-and-methods.md)
  * [Lifecycle Events生命周期事件](docs/zh-cn/lifecycle-events.md)
  * [Asynchronous Transitions异步转换](docs/zh-cn/async-transitions.md)
  * [Initialization初始化](docs/zh-cn/initialization.md)
  * [Error Handling错误处理](docs/zh-cn/error-handling.md)
  * [State History状态历史](docs/zh-cn/state-history.md)
  * [Visualization可视化](docs/zh-cn/visualization.md)
  * [State Machine Factory状态机工厂](docs/state-machine-factory.md)
  * [Upgrading from 2.x从2.x升级](docs/zh-cn/upgrading-from-v2.md)
 
# 贡献（〜^㉨^)〜

你可以通过创建issues或者pr来给项目[贡献](docs/contributing.md)

# 发行记录

查看 [发行记录](RELEASE_NOTES.md) 文件.

# 协议

查看[MIT协议](https://github.com/jakesgordon/javascript-state-machine/blob/master/LICENSE) 文件.

# 联系

如果你有想法, 反馈, 需求 或者bugs报告, 你可以联系我
[jake@codeincomplete.com](mailto:jake@codeincomplete.com), 或通过我的网站: [Code inComplete](http://codeincomplete.com/)
