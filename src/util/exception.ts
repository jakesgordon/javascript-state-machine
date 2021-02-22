import {State} from "../core.types";

export default class Exception {
  public message: string;
  public transition: string;
  public from: State;
  public to: State;
  public current: State;

  constructor(message: string, transition: string, from: State, to: State, current: State) {
    this.message    = message;
    this.transition = transition;
    this.from       = from;
    this.to         = to;
    this.current    = current;
  }
}