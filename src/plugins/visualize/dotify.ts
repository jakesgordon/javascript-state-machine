import {State} from "../../core.types";
import {DotConfig} from "./visualize.types";

function quote(name: string): string {
  return "\"" + name + "\""
}

function getState(state: State): string {
  return "  " + quote(state) + ";"
}

function getEdgeAttrs(edge): string {
  const output: string[] = [];

  Object.keys(edge).sort().forEach((key) => {
    if (key !== 'from' && key !== 'to') {
      output.push(key + "=" + quote(edge[key]))
    }
  });

  return output.length > 0 ? " [ " + output.join(" ; ") + " ]" : "";
}

function getEdge(edge) {
  return "  " + quote(edge.from) + " -> " + quote(edge.to) + getEdgeAttrs(edge) + ";"
}

export default function dotify(dotcfg?: DotConfig): string {

  dotcfg = dotcfg || {};

  const name        = dotcfg.name || 'fsm',
    states      = dotcfg.states || [],
    transitions = dotcfg.transitions || [],
    rankdir     = dotcfg.rankdir,
    output: any[]      = [];
  let n, max;

  output.push("digraph " + quote(name) + " {")

  if (rankdir)
    output.push("  rankdir=" + rankdir + ";")

  states.forEach((state) => output.push(getState(state)));
  transitions.forEach((transition) => output.push(getEdge(transition)));

  output.push("}")

  return output.join("\n")
}