import JSM from "../jsm";
import Config, {DefaultConfig, Options} from "../config";
import Exception from "../util/exception";
import {LooseObject, State} from "../core.types";
import StateMachine from "./app";

export interface GenericConstructor {
  new(...args: any[]): any;
}

// https://stackoverflow.com/questions/58168229/typescript-function-to-generate-a-class-implementing-an-interface
// export type StateMachineClass<T={}> = new (options?: Options | any) => IStateMachine;
export type StateMachineClass<T=Record<string, unknown>> = {
  new(options?: Options | any): IStateMachine;
  version: string;
  apply(instance: any, options?: Options): IStateMachine;
  factory<T>(...args: [T, Options] | [Options]): StateMachineClass<T & IStateMachine>;
  defaults: DefaultConfig;
}
export interface IStateMachine {
  _fsm: JSM;
  state: State;
  is: (state: State | State[]) => boolean;
  can: (transition: string) => boolean;
  cannot: (transition: string) => boolean;
  observe: (...args: any[]) => void;
  transitions: () => string[];
  allTransitions: () => string[];
  allStates: () => State[];
  onInvalidTransition: (t: string, from: string, to: string) => Exception;
  onPendingTransition: (t: string, from: string, to: string) => Exception;
  [method: string]: any;
}

// export interface StateMachineConstructor {
//   new: (options?: Options | any) => IStateMachine;
//   version: string;
//   defaults: DefaultConfig;
//   apply(instance: any, options?: Options): StateMachine;
//   factory<T>(...args: [T, Options] | [Options]): StateMachineConstructor & T;
//   [method: string]: any;
// }