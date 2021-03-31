import { State } from '../../src/core.types';
import { Event } from '../../src/jsm.types';

export type Entry = {
  event: Event | undefined;
  transition: string;
  from: State;
  to: any;
  current: State;
  args: any | undefined;
}

export default function() {
  const entries: Entry[] = [];
  const logger = function (lifecycle) {
    const entry: Entry = {
      event: lifecycle.event,
      transition: lifecycle.transition,
      from: lifecycle.from,
      to: lifecycle.to,
      current: lifecycle.fsm.state,
      args: undefined,
    }
    if (arguments.length > 1) {
      // eslint-disable-next-line prefer-rest-params
      entry.args = [].slice.call(arguments, 1);
    }
    entries.push(entry);
  };

  logger.clear = function () {
    entries.length = 0;
  }

  logger.log = entries;

  return logger;
}
