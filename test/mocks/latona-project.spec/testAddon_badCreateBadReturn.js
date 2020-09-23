/**
 * @fileoverview This is a test module that exports addon-compatible objects
 *   and functions, but `create` doesn't return `LatonaAddon`.
 */

const defaults = {
  foo: "bar"
};

const create = () => {
  return defaults;
};

module.exports.create = create;
module.exports.defaults = defaults;
