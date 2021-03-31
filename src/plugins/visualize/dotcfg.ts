import mixin from "../../util/mixin";
import Config from "../../config";
import {State, Transition} from "../../core.types";
import {DotConfig, Options} from "./visualize.types";

/**
 * pad adds a space before and after the input
 * @param name the input
 * @returns {string} the output string
 */
function pad(name: string): string {
  return " " + name + " "
}

/**
 * fetchConfig retrieves the config of the state machine
 * @param fsm
 * @returns {Config} the configuration
 */
function fetchConfig(fsm) {
  return (typeof fsm === 'function') ? fsm.prototype._fsm.config
    : fsm._fsm.config
}

/**
 *
 * @param orientation
 */
function getRankdir(orientation: string | undefined): string | undefined {
  if (orientation === 'horizontal')
    return 'LR';
  else if (orientation === 'vertical')
    return 'TB';
}

/**
 * getStates retrieves the states from the state machine. If no init flag
 * is set inside the options, the resultant list will not include the initial "from" state.
 * @param {Config} config
 * @param {Options} options
 */
function getStates(config: Config, options: Options): State[] {
  let index;
  const { states } = config;
  if (!options.init) { // if not showing init transition, then slice out the implied init :from state
    index  = states.indexOf(config.init.from);
    return states.slice(0, index).concat(states.slice(index+1));
  }
  return states;
}

function getTransition(name, from, to, dot, config, options, output) {
  const wildcard = config.defaults.wildcard

  if (Array.isArray(from)) {
    from.forEach((state) => {
      output = getTransition(name, state, to, dot, config, options, output)
    });
  } else if (from === wildcard || from === undefined) {
    config.states.forEach((state) => {
      output = getTransition(name, state, to, dot, config, options, output)
    });
  } else if (to === wildcard || to === undefined) {
    output = getTransition(name, from, from, dot, config, options, output)
  } else if (typeof to === 'function') {
    // do nothing, can't display conditional transition
  } else {
    output.push(mixin({}, { from: from, to: to, label: pad(name) }, dot || {}))
  }
  return output;
}

function getTransitions(config: Config, options: Options) {
  const { init, options: configOptions } = config;
  let output = [];
  let transitions: Transition[] = [];

  if ("transitions" in configOptions && configOptions.transitions && Array.isArray(configOptions.transitions)) {
    transitions = configOptions.transitions;
  }

  if (options.init && init.active) {
    output = getTransition(init.name, init.from, init.to, init.dot, config, options, output);
  }
  transitions.forEach((transition) => {
    output = getTransition(transition.name, transition.from, transition.to, transition.dot, config, options, output);
  });
  return output;
}

export default function dotcfg(fsm, options?: Options): DotConfig {

  options = options || {}

  const config      = fetchConfig(fsm);
  const states      = getStates(config, options);
  const transitions = getTransitions(config, options);

  return {
    name: options.name,
    rankdir: getRankdir(options.orientation),
    states: (states && states.length > 0) ? states : undefined,
    transitions: (transitions && transitions.length > 0) ? transitions : undefined,
  };
}
