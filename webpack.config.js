module.exports = function(env) {

  'use strict'

  const webpack   = require('webpack'),
        glob      = require('glob'),
        path      = require('path'),
        pascalize = require('pascal-case'),
        source    = 'src',
        output    = 'lib',
        config    = [];

  config.push({
    name:     'state-machine',
    library:  'StateMachine',
    entry:    'app'
  })

  glob.sync("src/plugin/*.js").forEach(function(plugin) {
    const name = path.basename(plugin, '.js');
    config.push({
      library:  pascalize('state-machine-' + name),
      entry:    'plugin/' + name,
      name:     name
    })
  });

  return config.map(function(cfg) {
    return {
      entry: cfg.entry,
      resolve: {
        modules: [ source ]
      },
      output: {
        filename: path.join(output, cfg.name + '.js'),
        library: cfg.library,
        libraryTarget: 'umd',
        umdNamedDefine: true
      }
    }
  });

}
