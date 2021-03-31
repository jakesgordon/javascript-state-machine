import camelize from '../util/camelize';
import Config, {Options} from "../config";
import {Plugin} from '../plugin.type';
import {LifecycleContext} from "../core.types";

export default function(options: Options): Plugin {
  options = options || {};

  const past   = camelize(options.name || options.past   || 'history'),
    future     = camelize(                options.future || 'future'),
    clear      = camelize.prepended('clear', past),
    back       = camelize.prepended(past,   'back'),
    forward    = camelize.prepended(past,   'forward'),
    canBack    = camelize.prepended('can',   back),
    canForward = camelize.prepended('can',   forward),
    max        = options.max;

  const plugin: Plugin = {

    configure(config) {
      config.addTransitionLifecycleNames(back);
      config.addTransitionLifecycleNames(forward);
    },

    init(instance) {
      instance[past]   = [];
      instance[future] = [];
    },

    lifecycle: function(instance, lifecycle: LifecycleContext) {
      if (lifecycle.event === 'onEnterState') {
        instance[past].push(lifecycle.to);
        if (max && instance[past].length > max)
          instance[past].shift();
        if (lifecycle.transition !== back && lifecycle.transition !== forward)
          instance[future].length = 0;
      }
    },

    methods: {
      [clear](this) {
        this[past].length = 0
        this[future].length = 0
      },

      [back](this) {
        if (!this[canBack])
          throw Error('no history');
        const from = this[past].pop(),
          to   = this[past].pop();
        this[future].push(from);
        this._fsm.transit(back, from, to, []);
      },

      [forward](this) {
        if (!this[canForward])
          throw Error('no history');
        const from = this.state,
          to = this[future].pop();
        this._fsm.transit(forward, from, to, []);
      },
    },
    properties: {
      [canBack]: {
        get(this) {
          return this[past].length > 1;
        },
      },

      [canForward]: {
        get(this) {
          return this[future].length > 0
        },
      },
    },
  };

  return plugin;
}