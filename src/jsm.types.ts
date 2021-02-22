import {Methods} from "./config";
import Config from "./config";
import {State} from "./core.types";
import Exception from "./util/exception";

export type Event = string;

export interface EventItem {
  event: Event | null;
  observers: any;
  pluggable?: boolean;
}

export type EventObserverQueue = EventItem[];

export type Observer = Methods;

export interface IFsm {
  context: any;
  config: Config;
  state: State;
  observers: Observer[];

  init(args): void;
  is(state: string|string[]): boolean;
  isPending(): boolean;
  can(transition: string): boolean;
  cannot(transition): boolean;
  allStates(): string[];
  allTransitions(): string[];
  transitions(): string[];
  observe(args): void;
  onInvalidTransition(this: IFsm, transition: string, from: string, to: string): Exception;
  onPendingTransition(this: IFsm, transition: string, from: string, to: string): Exception;
}