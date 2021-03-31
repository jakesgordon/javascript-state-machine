import mixin from './util/mixin';
import Exception from './util/exception';
import * as plugin from './plugin'
import Config from './config/config';
import {LifecycleContext} from "./core.types";
import {EventItem, EventObserverQueue, IFsm, Observer} from "./jsm.types";
import {State} from "./core.types";

const UNOBSERVED: EventItem = {
  event: null,
  observers: [],
};

class JSM implements IFsm {
  public context: any;
  public config: Config;
  public state: State;
  public observers: Observer[];

  private pending: boolean;

  constructor(context, config: Config) {
    this.context = context;
    this.config    = config;
    this.state     = config.init.from;
    this.observers = [context];

    this.pending = false;
  }

  public init(args): void {
    // console.log(args);
    // console.log(this.config.data.apply(this.context, args));
    mixin(this.context, this.config.data.apply(this.context, args));
    plugin.hook(this, 'init');
    if (this.config.init.active)
      return this.fire(this.config.init.name, []);
  }

  /**
   * is verifies the state of the machine
   * @param {string|string[]} state the state name to be verified, or a list of states that
   *        may contain the state of the machine
   * @returns {boolean} verification result
   */
  public is(state: string|string[]): boolean {
    return Array.isArray(state) ?
      (state.indexOf(this.state) >= 0) :
      (this.state === state);
  }

  /**
   * isPending checks if the machine is pending a transition
   * @returns {boolean}
   */
  public isPending(): boolean { return this.pending; }

  /**
   * can queries if the transition can be executed. If the machine state is pending,
   * then no, otherwise, seeks if the transition is allowed depending on the current
   * state of the machine.
   * @param transition the transition name
   * @returns {boolean}
   */
  public can(transition: string): boolean {
    return !this.isPending() && !!this.seek(transition);
  }

  /**
   * cannot does the opposite of can, see there for details.
   * @param transition the transition name
   * @returns {boolean}
   */
  public cannot(transition): boolean {
    return !this.can(transition);
  }

  /** allStates returns all the potential states that
   * exist inside the state machine.
   * @returns {string[]} the list of states
   */
  public allStates(): string[] {
    return this.config.allStates();
  }

  /** allTransitions returns all the potential transitions that
   * exist inside the state machine.
   * @returns {string[]} the list of transitions
   */
  public allTransitions(): string[] {
    return this.config.allTransitions();
  }

  /**
   * transitions retrieves the list of transitions allowed for the current state
   * @returns {string[]} the list of transitions
   */
  public transitions(): string[] {
    return this.config.transitionsFor(this.state);
  }

  /**
   * seek finds the "to" destination of a given transition.
   * @param {string} transition the transition name
   * @param {any | any[]=} args the arguments received from when user executes the transition (Optional).
   * @private
   */
  private seek(transition: string, args?: any | any[]): any | Promise<string | undefined> {
    const { wildcard } = this.config.defaults;
    const entry = this.config.transitionFor(this.state, transition);
    const to = entry && entry.to;

    if (typeof to === 'function') {
      return to.apply(this.context, args);
    } else if (to === wildcard)
      return this.state;
    else
      return to;
  }

  public fire(transition: string, args?: any | any[]) {
    const toDestination = this.seek(transition, args);
    if (toDestination && typeof toDestination.then === 'function') {
      return toDestination.then((output) => this.transit(transition, this.state, output, args));
    } else {
      return this.transit(transition, this.state, toDestination, args);
    }
  }

  /**
   * transit triggers a transition.
   * At this point, the "to" destination is already determined.
   * 1. Check if the transition will lead to a change of state.
   * 2. Make sure the "to" destination is valid.
   * 3. Make sure there is not an ongoing transition.
   * 4. Flag the JSM as there is a transition ongoing.
   * 5. If the "to" destination does not exist in JSM's internal lookup, add the new state.
   * 6. Trigger the transition by returning a function that runs the whole lifecycle.
   * @param transition the transition name
   * @param from the original state
   * @param {string | undefined} to the "to" destination
   * @param {any | any[]=} args the arguments received from when user executes the transition (Optional).
   * @private
   */
  private transit(transition: string, from: string, to: string | undefined, args?: any | any[]) {
    const { lifecycle } = this.config;

    let changed;
    if ("observeUnchangedState" in this.config.options) {
      changed = this.config.options.observeUnchangedState || (from !== to);
    } else {
      changed = from !== to;
    }

    if (!to)
      return this.context.onInvalidTransition(transition, from, to);

    if (this.isPending())
      return this.context.onPendingTransition(transition, from, to);

    this.config.addState(to);  // might need to add this state if it's unknown (e.g. conditional transition or goto)

    this.beginTransit();

    const lifeCycleContext: LifecycleContext = {
      transition: transition,
      from:       from,
      to:         to,
      fsm:        this.context,
      event:      null,
    };
    args.unshift(lifeCycleContext);      // this context will be passed to each lifecycle event observer

    return this.observeEvents([
      this.observersForEvent(lifecycle.onBefore.transition /* onBeforeTransition */),
      this.observersForEvent(lifecycle.onBefore[transition] /* onBefore[Transition] */),
      changed ? this.observersForEvent(lifecycle.onLeave.state /* onLeaveState */) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onLeave[from] /* onLeave[FromState] */) : UNOBSERVED,
      this.observersForEvent(lifecycle.on.transition /* on[Transition] */),
      changed ? { event: 'doTransit', observers: [ this ] } : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter.state /* onEnterState */) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter[to] /* onEnter[ToState] */) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.on[to] /* on[ToState] */) : UNOBSERVED,
      this.observersForEvent(lifecycle.onAfter.transition /* onAfterTransition */),
      this.observersForEvent(lifecycle.onAfter[transition] /* onAfter[Transition] */),
      this.observersForEvent(lifecycle.on[transition] /* on[Transition] */)
    ], args);
  }

  /**
   * beginTransit flags the pending property to true to indicate
   * there is an ongoing transition.
   * @private
   */
  private beginTransit(): void { this.pending = true; }

  /**
   * endTransit flags the pending property to false to indicate
   * the transition is done or stopped during a transition.
   * @param {boolean} result true - transition is done, false - transition is stopped
   * @returns {boolean} the result
   * @private
   */
  private endTransit(result: boolean): boolean { this.pending = false; return result; }

  /**
   * failTransit flags the pending property to false to
   * indicate the transition is stopped because there is an error during transiton.
   * @param {Error} result error when transition failed
   * @returns {Error} the result
   * @private
   */
  private failTransit(result): Error { this.pending = false; throw result; }

  private doTransit(lifecycle) { this.state = lifecycle.to; }

  /**
   * observe attaches an observer to the list of observers.
   * If the number of arguments is 2, the first would be
   * the lifecycle name, second would be the observer. If
   * the number of arguments is 1, then the observer should be
   * an object with the lifecycle as key, the observer function
   * as the value.
   * @param args
   */
  public observe(args) {
    if (args.length === 2) {
      const observer = {};
      observer[args[0]] = args[1];
      this.observers.push(observer);
    }
    else {
      this.observers.push(args[0]);
    }
  }

  /**
   * observersForEvent constructs a list of observers that are interested
   * in the given event.
   * @param {string} event the event name
   * @returns {[string, Observer[], bool]} the event, list of observers, true
   * @private
   */
  private observersForEvent(event: string): EventItem { // TODO: this could be cached
    const result = this.observers.filter((observer) => observer[event]);
    return {
      event,
      observers: result,
      pluggable: true,
    };
  }

  /**
   * observeEvents
   * @param eventQueue the event queue that contains the list of observers
   * @param args
   * @param previousEvent
   * @param previousResult
   * @private
   */
  private observeEvents(eventQueue: EventObserverQueue, args: [LifecycleContext, ...any], previousEvent?: string | null | undefined, previousResult?: undefined | boolean) {
    // Recursively dequeue the event queue

    // Stopping condition
    if (eventQueue.length === 0) {
      return this.endTransit(previousResult === undefined ? true : previousResult);
    }

    // Initial
    const { event: eventName, observers, pluggable } = eventQueue[0];

    // Add eventName to the LifeCycleContext
    args[0].event = eventName;
    if (eventName && pluggable && eventName !== previousEvent)
      // Execute the plugins attached to the state machine
      // console.log(args);
      plugin.hook(this, 'lifecycle', args);

    // Execute the observer functions
    if (observers.length == 0) {
      eventQueue.shift();
      // Dequeue
      return this.observeEvents(eventQueue, args, eventName, previousResult);
    } else {
      // Get the first observer
      const observer = observers.shift();

      // Execute the observer
      if (eventName) {
        // const result = observer[eventName].apply(observer, args);
        const result = observer[eventName](...args);

        if (result && typeof result.then === 'function') {
          // result is a Promise
          return result.then(this.observeEvents.bind(this, eventQueue, args, eventName))
            .catch(this.failTransit.bind(this))
        } else if (result === false) {
          // Halt the transition
          return this.endTransit(false);
        } else {
          return this.observeEvents(eventQueue, args, eventName, result);
        }
      }
    }
  }

  /**
   * onInvalidTransition throws an error when the to destination is invalid
   * @param {JSM} this the JSM context (internal)
   * @param {string} transition the transition name
   * @param {string} from the original state
   * @param {string|undefined} to anything that is not an non-empty string
   */
  public onInvalidTransition(this: JSM, transition: string, from: string, to: string): Exception {
    throw new Exception("transition is invalid in current state", transition, from, to, this.state);
  }

  /**
   * onPendingTransition throws an error when there is a transition trying to be fired when
   * there is already an ongoing transition.
   * @param {JSM} this the JSM context (internal)
   * @param {string} transition the transition name
   * @param {string} from the original state
   * @param {string|undefined} to anything that is not an non-empty string
   */
  public onPendingTransition(this: JSM, transition: string, from: string, to: string): Exception {
    throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
  }
}

export default JSM;
