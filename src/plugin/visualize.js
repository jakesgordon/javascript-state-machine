'use strict'

//-------------------------------------------------------------------------------------------------

var mixin = require('../util/mixin')

//-------------------------------------------------------------------------------------------------

function visualize(fsm, options) {
  return dotify(dotcfg(fsm, options));
}

//-------------------------------------------------------------------------------------------------

function dotcfg(fsm, options) {

  options = options || {}

  var config      = dotcfg.fetch(fsm),
      name        = options.name,
      rankdir     = dotcfg.rankdir(options.orientation),
      states      = dotcfg.states(config, options),
      statedefs   = dotcfg.statedefs(config, options),
      transitions = dotcfg.transitions(config, options),
      dotPrefix   = config.dotPrefix,
      result      = { }

  if (name)
    result.name = name

  if (rankdir)
    result.rankdir = rankdir

  if (states && states.length > 0)
    result.states = states

  if (statedefs && statedefs.length > 0)
    result.statedefs = statedefs;

  if (transitions && transitions.length > 0)
    result.transitions = transitions

  if (dotPrefix)
    result.dotPrefix = dotPrefix;

  return result
}

//-------------------------------------------------------------------------------------------------

dotcfg.fetch = function(fsm) {
  return (typeof fsm === 'function') ? fsm.prototype._fsm.config
                                     : fsm._fsm.config
}

dotcfg.rankdir = function(orientation) {
  if (orientation === 'horizontal')
    return 'LR';
  else if (orientation === 'vertical')
    return 'TB';
}

dotcfg.states = function(config, options) {
  var index, states = config.states;
  if (!options.init) { // if not showing init transition, then slice out the implied init :from state
    index  = states.indexOf(config.init.from);
    states = states.slice(0, index).concat(states.slice(index+1));
  }
  return states;
}

dotcfg.statedefs = function(config, options) {
  return config.options['statedefs'];
          // can be null
}

dotcfg.transitions = function(config, options) {
  var n, max, transition,
      init        = config.init,
      transitions = config.options.transitions || [], // easier to visualize using the ORIGINAL transition declarations rather than our run-time mapping
      output = [];
  if (options.init && init.active)
    dotcfg.transition(init.name, init.from, init.to, init.dot, config, options, output)
  for (n = 0, max = transitions.length ; n < max ; n++) {
    transition = config.options.transitions[n]
    dotcfg.transition(transition.name, transition.from, transition.to, transition.dot, config, options, output)
  }
  return output
}

dotcfg.transition = function(name, from, to, dot, config, options, output) {
  var n, max, wildcard = config.defaults.wildcard

  if (Array.isArray(from)) {
    for(n = 0, max = from.length ; n < max ; n++)
      dotcfg.transition(name, from[n], to, dot, config, options, output)
  }
  else if (from === wildcard || from === undefined) {
    for(n = 0, max = config.states.length ; n < max ; n++)
      dotcfg.transition(name, config.states[n], to, dot, config, options, output)
  }
  else if (to === wildcard || to === undefined) {
    dotcfg.transition(name, from, from, dot, config, options, output)
  }
  else if (typeof to === 'function') {
    // do nothing, can't display conditional transition
  }
  else {
    output.push(mixin({}, { from: from, to: to, label: pad(name) }, dot || {}))
  }
}

//-------------------------------------------------------------------------------------------------

function pad(name) {
  return " " + name + " "
}

function quote(name) {
  return "\"" + name + "\""
}

function dotify(dotcfg) {

  dotcfg = dotcfg || {};

  var name        = dotcfg.name || 'fsm',
      states      = dotcfg.states || [],
      transitions = dotcfg.transitions || [],
      statedefs   = dotcfg.statedefs,
      dotPrefix   = dotcfg.dotPrefix,
      rankdir     = dotcfg.rankdir,
      output      = [],
      n, max;

  output.push("digraph " + quote(name) + " {")
  if (rankdir)
    output.push("  rankdir=" + rankdir + ";")

  if (dotPrefix) {
    output.push(dotify.dotPrefix(dotPrefix));
  }

  if (statedefs) {
    for(n = 0, max = statedefs.length ; n < max ; n++)
      output.push(dotify.statedef(statedefs[n]))
  }
  else {
    for(n = 0, max = states.length ; n < max ; n++)
      output.push(dotify.gen(states[n]))
  }

  for(n = 0, max = transitions.length ; n < max ; n++)
    output.push(dotify.edge(transitions[n]))
  output.push("}")
  return output.join("\n")

}

dotify.gen = function(state) {
  return "  " + quote(state) + ";"
}

dotify.statedef = function(statedef) {
  return "  " + quote(statedef.name) + dotify.gen.attr(statedef.dot) + ";"
}

dotify.edge = function(edge) {
  return "  " + quote(edge.from) + " -> " + quote(edge.to) + dotify.edge.attr(edge) + ";"
}

dotify.dotPrefix = function(dotPrefix) {
  var prefixStrAry = [];
  var ix, key;
  var keys = Object.keys(dotPrefix);
  for (ix = 0; ix < keys.length; ix++) {
    key = keys[ix];
    prefixStrAry.push('  ' + key + ' ' + dotify.gen.attr(dotPrefix[key]) + ";" );
  }

  return prefixStrAry.join("\n");
}

dotify.edge.attr = function(edge) {
  var n, max, key, keys = Object.keys(edge).sort(), output = [];
  for(n = 0, max = keys.length ; n < max ; n++) {
    key = keys[n];
    if (key !== 'from' && key !== 'to')
      output.push(key + "=" + quote(edge[key]))
  }
  return output.length > 0 ? " [ " + output.join(" ; ") + " ]" : ""
}

dotify.gen.attr = function(statedef_dot) {
  var n, max, key, keys = Object.keys(statedef_dot).sort(), output = [];
  for(n = 0, max = keys.length ; n < max ; n++) {
    key = keys[n];
    output.push(key + "=" + quote(statedef_dot[key]))
  }
  return output.length > 0 ? " [ " + output.join(", ") + " ]" : ""
}

//-------------------------------------------------------------------------------------------------

visualize.dotcfg = dotcfg;
visualize.dotify = dotify;

//-------------------------------------------------------------------------------------------------

module.exports = visualize;

//-------------------------------------------------------------------------------------------------
