'use strict'

//-------------------------------------------------------------------------------------------------

var mixin = require('./util/mixin');

//-------------------------------------------------------------------------------------------------

module.exports = {

  build: function(target, config) {
    var n, max, plugin, plugins = config.plugins;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    }
  },

  hook: function(fsm, name, additional) {
    var n, max, method, plugin,
        plugins = fsm.config.plugins,
        args    = [fsm.context];

    if (additional)
      args = args.concat(additional)

    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n]
      method = plugins[n][name]
      if (method)
        method.apply(plugin, args);
    }
  }

}

//-------------------------------------------------------------------------------------------------
