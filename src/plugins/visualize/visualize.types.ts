import {State, Transition} from "../../core.types";

export type Options = {
  name?: string;
  init?: boolean;
  orientation?: string;
};

export type DotConfig = {
  name?: string;
  rankdir?: string;
  states?: State[];
  // transitions?: {
  //   from: State,
  //   to?: State,
  //   [key: string]: any;
  // };
  transitions?: any[];
};