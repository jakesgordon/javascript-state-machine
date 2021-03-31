import {LifecycleContext} from "./core.types";

export type Plugin = {
  properties?: { [property: string]: any; };
  methods?: { [method: string]: any; };
  configure?: ((...args: any[]) => any);
  init?: ((...args: any[]) => any);
  lifecycle?: ((context: any, lifecycle: LifecycleContext, ...args: any[]) => any);
} | ((...args: any[]) => Plugin);
