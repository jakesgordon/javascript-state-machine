import {Options} from './visualize.types';
import dotcfg from './dotcfg';
import dotify from './dotify';

export type { Options } from './visualize.types';

const visualize = (fsm, options?: Options) => dotify(dotcfg(fsm, options));

visualize.dotcfg = dotcfg;
visualize.dotify = dotify;

export default visualize;