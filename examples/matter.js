var StateMachine = require('../src/app'),
    visualize    = require('../src/plugin/visualize');

var Matter = StateMachine.factory({
  init: 'solid',
  transitions: [
    { name: 'melt',     from: 'solid',  to: 'liquid', dot: { headport: 'nw' } },
    { name: 'freeze',   from: 'liquid', to: 'solid',  dot: { headport: 'se' } },
    { name: 'vaporize', from: 'liquid', to: 'gas',    dot: { headport: 'nw' } },
    { name: 'condense', from: 'gas',    to: 'liquid', dot: { headport: 'se' } }
  ]
});

Matter.visualize = function() {
  return visualize(Matter, { name: 'matter', orientation: 'horizontal' })
}

module.exports = Matter
