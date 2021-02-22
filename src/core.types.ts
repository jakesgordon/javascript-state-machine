export interface LooseObject {
  [key: string]: any
}

export type State = string;

export type Transition = {
  name: string;
  from?: State | State[] | '*';
  to?: string | ((...args: any[]) => string | undefined | Promise<string | undefined>);
  dot?: {
    color?: string; // red
    headport?: string; // nw
    tailport?: string; // ne
    label?: string; // A2B
  };
}

export interface LifecycleContext {
  transition: string;
  from: State;
  to: State;
  fsm: any;
  event: string | null;
}