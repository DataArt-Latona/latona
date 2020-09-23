/**
 * @fileoverview This module is a valid latona addon module, though it doesn't
 *   return anything fancy - just blank LatonaAddon object.
 */
const defaults = {
  description: "simple test addon"
};

const create = (options, addonCreateCb) => {
  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }

  const opt = Object.assign({}, defaults, options);
  const addon = addonCreateCb("testAddon_simple", opt.description);
  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
