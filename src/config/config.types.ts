import {LifecycleContext, State, Transition} from "../core.types";
import {Plugin} from '../plugin.type';

export type DefaultConfig = {
  wildcard: string;
  init: HardTransition;
};

// For the initial transition, the original state (the `from` property) is required.
export interface HardTransition extends Transition {
  name: string;
  from: State;
  active?: boolean;
}

export interface TransitionLookup {
  [fromState: string]: { [transition: string]: HardTransition | Record<string, never> } | Record<string, never>;
}

type Callback = (...args: any[]) => any;

interface CoreLifeCycleMethods {
  onBeforeTransition?(lifecycle: LifecycleContext, ...args: any[]): boolean | Promise<boolean> | void; // 1
  onLeaveState?(lifecycle: LifecycleContext, ...args: any[]): boolean | Promise<boolean> | void; // 2
  onTransition?(lifecycle: LifecycleContext, ...args: any[]): boolean | Promise<boolean> | void; // 3
  onEnterState?(lifecycle: LifecycleContext, ...args: any[]): any | Promise<any> | void; // 4
  onAfterTransition?(lifecycle: LifecycleContext, ...args: any[]): any | Promise<any> | void; // 5
  onPendingTransition?(transition: string, from: string, to: string): any | Promise<any>;
}

export interface Methods extends CoreLifeCycleMethods {
  [method: string]: Callback | undefined;
}

export interface LifeCycle {
  onBefore: {
    transition: 'onBeforeTransition',
    [transitionName: string]: string, // 'onBefore[transitionName]'
  },
  onAfter: {
    transition: 'onAfterTransition',
    [transitionName: string]: string, // 'onAfter[transitionName]'
  },
  onEnter: {
    state: 'onEnterState',
    [stateName: string]: string, // 'onEnter[stateName]'
  },
  onLeave: {
    state: 'onLeaveState',
    [stateName: string]: string, // 'onLeave[stateName]'
  },
  on: {
    transition: 'onTransition',
  },
}

export interface Options {
  name?: string;
  past?: string;
  future?: string;
  init?: string | Transition;
  max?: number; // max history
  state?: string;
  transitions?: Transition[];
  methods?: Methods;
  data?: any; // {} | any[] | ((...args: any[]) => {} | any[]);
  plugins?: Plugin[];
  observeUnchangedState?: boolean;
}