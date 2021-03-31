import mixin from '../util/mixin';
import camelize from '../util/camelize';
import * as plugin from '../plugin';
import Config from '../config/config';
import JSM from '../jsm';
import {Options} from "../config";
import {StateMachineClass, GenericConstructor, IStateMachine} from "./app.types";
import {State} from "../core.types";

function apply(instance: any, options?: Options): IStateMachine {
  // Check if target is an object or an array
  if ((typeof instance !== 'object') || Array.isArray(instance))
    throw Error('StateMachine can only be applied to objects');
  const cstor = build(instance);
  const newStance =  new cstor(options);
  // return newStance as StateMachine & any;
  return newStance;
}

/**
 * factory takes in an object or class constructor and inherits the object or class
 * with the state machine class. When there are one argument, it should be the constructor
 * but when there are two arguments,the first one should be the constructor, and the second
 * argument should be the configuration options for the state machine.
 * @param args
 */
function factory<T>(...args: [T, Options] | [Options]): StateMachineClass<T & IStateMachine> {
  let cstor, options;
  if (typeof args[0] === 'function') {
    cstor   = args[0];
    options = args[1] || {};
  } else {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    cstor = function() { };
    options = args[0] || {};
  }
  return build(cstor, options);
}

/**
 * build builds the eventual state machine class. If a constructor is fed, then the state
 * machine class is going to inherit it and return the new class with the constructor taking
 * in the arguments for the parent constructor, if the argument is an object.
 * @param cstor
 * @param initOptions
 */
function build<T>(cstor?: GenericConstructor | Record<string, unknown> | undefined, initOptions?: Options): StateMachineClass<T & IStateMachine> {

  class EmptyClass {}

  let chosenBaseClass;
  if (typeof cstor === 'function') {
    // assume it's a constructor
    chosenBaseClass  = cstor;
  } else if (typeof cstor === 'object') {
    chosenBaseClass = EmptyClass;
  } else if (cstor !== undefined) {
    throw Error(`only object and constructor allowed, got ${typeof cstor}`);
  }

  return class DerivedStateMachine extends chosenBaseClass implements IStateMachine {

    public _fsm: JSM;

    public static version  = '3.0.1';
    public static factory  = factory;
    public static apply    = apply;
    public static defaults = {
      wildcard: '*',
      init: {
        name: 'init',
        from: 'none'
      }
    }
    // For factory
    constructor(args?: any | undefined) {
      super(args);
      if (chosenBaseClass === EmptyClass) {
        // what's being fed is an object
        // so mixin the object's properties into this instance
        mixin(this, cstor);
      }
      let options;
      if (initOptions) {
        // when the state machine is defined using factory method,
        // the configuration of the state machine should have already
        // been fed into through the factory method
        options = initOptions;
      }
      if (chosenBaseClass === EmptyClass && args && typeof args === 'object') {
        options = args
      }
      const config = new Config(options, DerivedStateMachine);
      plugin.build(this, config);
      mixin(this, config.methods);

      config.allTransitions().forEach((transition) => {
        // console.log(this);
        this[camelize(transition)] = function(this: IStateMachine) {
          // eslint-disable-next-line prefer-rest-params
          return this._fsm.fire(transition, [].slice.call(arguments))
        }
      });

      this._fsm = new JSM(this, config);
      // eslint-disable-next-line prefer-rest-params
      this._fsm.init(arguments);
    }

    get state(): State {
      return this._fsm.state
    }

    set state(state: State) { throw Error('use transitions to change state'); }

    public is(this: IStateMachine, state: State | State[])       { return this._fsm.is(state);                        }
    public can(this: IStateMachine, transition: string)          { return this._fsm.can(transition);                  }
    public cannot(this: IStateMachine, transition: string)       { return this._fsm.cannot(transition);               }
    // eslint-disable-next-line prefer-rest-params
    public observe(this: IStateMachine)                          { return this._fsm.observe(arguments);               }
    public transitions(this: IStateMachine)                      { return this._fsm.transitions();                    }
    public allTransitions(this: IStateMachine)                   { return this._fsm.allTransitions();                 }
    public allStates(this: IStateMachine)                        { return this._fsm.allStates();                      }
    public onInvalidTransition(this: IStateMachine, t, from, to) { return this._fsm.onInvalidTransition(t, from, to); }
    public onPendingTransition(this: IStateMachine, t, from, to) { return this._fsm.onPendingTransition(t, from, to); }
  }
}

const StateMachine = build({});
export default StateMachine;