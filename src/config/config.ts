import mixin from '../util/mixin';
import camelize from '../util/camelize';
import {
  DefaultConfig,
  LifeCycle,
  Methods,
  Options,
  HardTransition,
  TransitionLookup,
} from "./config.types";
import {State, Transition} from "../core.types";

class Config {
  public options: Options | Record<string, unknown>;
  public defaults: DefaultConfig;
  public states: State[];
  public transitions: string[];
  public map: TransitionLookup;
  public lifecycle: LifeCycle;
  public init: HardTransition;
  public data: any;
  public methods: Methods;
  public plugins: any;

  constructor(options: Options | undefined | any, StateMachine) {
    // console.log(options);
    const options_ = options || {};

    this.states      = [];
    this.transitions = [];
    this.map         = {};
    this.defaults    = StateMachine.defaults;
    this.options     = options_; // preserving original options can be useful (e.g dotify plugin)
    this.lifecycle   = Config.configureLifecycle();
    this.map[this.defaults.wildcard] = {};

    this.init        = this.configureInitTransition(options_.init);
    this.data        = this.configureData(options_.data);
    this.methods     = Config.configureMethods(options_.methods);

    this.configureTransitions(options_.transitions || []);

    this.plugins = this.configurePlugins(options_.plugins, StateMachine.plugin);
  }

  /**
   * addState adds a new state to the state machine. If the state
   * already exists, nothing happens.
   * @param {State} name the state name
   * @private
   */
  public addState(name: State) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  }

  /**
   * addStateLifecycleNames registers the state-related lifecycles inside
   * the machine's lifecycle (onEnter[State], onLeave[State], on[State]).
   * @param {State} name the state name
   * @private
   */
  private addStateLifecycleNames(name: State): void {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  }

  /**
   * addTransition adds a new transition to the state machine. If transition
   * name already exists, nothing happens.
   * @param {string} name the transition name
   * @private
   */
  private addTransition(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  }

  /**
   * addTransitionLifecycleNames registers the transition-related lifecycles inside
   * the machine's lifecycle (onBefore[Transition], onAfter[Transition], on[Transition]).
   * @param name
   * @private
   */
  public addTransitionLifecycleNames(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  }

  /**
   * mapTransition
   * @param transition
   * @private
   */
  private mapTransition(transition: HardTransition): HardTransition {
    const { name, from, to } = transition;

    // Add states
    this.addState(from);
    if (to && typeof to !== 'function')
      this.addState(to);

    // Add transitions
    this.addTransition(name);

    this.map[from][name] = transition;

    return transition;
  }

  private static configureLifecycle(): LifeCycle {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  }

  /**
   * configureHardTransition configures the initial transition.
   * @param init the initial state name
   * @private
   */
  private configureInitTransition(init: string | Record<string, unknown> | undefined): HardTransition {
    if (typeof init === 'string') {
      // init is simply a state name
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      // init is an object
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      // Use "none" as the init state
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  }

  private configureData(data): (() => any) {
    // console.log(data);
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  }

  /**
   * configureMethods
   * @param methods
   * @private
   */
  private static configureMethods(methods: Methods | undefined) {
    return methods || {};
  }

  private configurePlugins(plugins, builtin) {
    let plugins_ = plugins || [];

    plugins_ = plugins_.map((plugin) => {
      let plugin_ = plugin;
      if (typeof plugin_ === 'function')
        plugin_ = plugin()
      if (plugin_.configure)
        plugin_.configure(this);
      return plugin_;
    })
    return plugins_;
  }

  private configureTransitions(transitions: Transition[]) {
    const { wildcard } = this.defaults;

    transitions.forEach((transition) => {
      const from = Array.isArray(transition.from) ?
        transition.from :
        [transition.from || wildcard];
      const to = transition.to || wildcard;

      from.forEach((state) => {
        this.mapTransition({ name: transition.name, from: state, to });
      });
    });
  }

  /**
   *
   * @param {State} state the state name
   * @param {string} transition the transition name
   * @returns {HardTransition} the transition info
   */
  public transitionFor(state: State, transition: string): HardTransition | Record<string, unknown> {
    const { wildcard } = this.defaults;
    return this.map[state][transition] || this.map[wildcard][transition];
  }

  /**
   * transitionsFor retrieves the list of transitions allowed for the given state
   * @param {State} state the state name
   * @returns {string[]} the list of transitions
   */
  public transitionsFor(state: State): string[] {
    const { wildcard } = this.defaults;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  }

  public allStates(): State[] {
    return this.states;
  }

  public allTransitions(): string[] {
    return this.transitions;
  }
}

export default Config;
