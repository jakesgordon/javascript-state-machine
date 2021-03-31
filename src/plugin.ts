import mixin from './util/mixin';

/**
 * build takes in a target object and adds the properties and methods
 * of the plugins inside the config to the target object.
 * @param target
 * @param config
 */
export function build(target, config) {
  const { plugins } = config;
  if (Array.isArray(plugins) && plugins.length > 0) {
    plugins.forEach((plugin) => {
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    });
  }
}

/**
 * hook iterates over the plugins attached to the machine, and
 * executes if the method name specified exists in each of the plugin.
 * @param fsm the fsm instance
 * @param name the method name to be executed inside the plugin
 * @param additional additional arguments to be used for the plugin
 */
export function hook(fsm, name: string, additional?: any|any[]) {
  const plugins = fsm.config.plugins;
  let args = [fsm.context];

  if (additional)
    args = args.concat(additional);

  if (Array.isArray(plugins) && plugins.length > 0) {
    plugins.forEach((plugin) => {
      if (plugin[name]) {
        const method = plugin[name];
        method.apply(plugin, args);
      }
    });
  }
}