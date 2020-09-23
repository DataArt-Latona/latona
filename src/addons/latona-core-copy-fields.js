/**
 * This **Latona Addon** module copies fields from a referenced table into
 *   referencing tables. Typical use case is copying natural keys, surrogate
 *   keys, key hash fields and others.
 *
 * (Note: please use this module as a part of the project composition)
 *
 * @module latona/addons/latona-core-copy-fields
 */
const { validateArray } = require("../utils/validation");
const { deepClone } = require("../utils/object");
const { CopyFieldsRule } = require("../settings/copy-fields-rule");
const { Field } = require("../field");

/**
 * Copies fields from referenced tables into referencing table
 * @param {Object} table Table instance
 * @param {CopyFieldsRule[]} rules Copy rules
 * @private
 */
function copyReferencedFields(table, rules) {
  const { tableScope, referencedTables, fields } = table;

  if (referencedTables && referencedTables.length) {
    const matchingCopyRules = rules.filter(
      rule => !rule.tableScope || rule.tableScope === tableScope
    );

    matchingCopyRules.forEach(rule => {
      // we need to iterate all referenced tables...
      referencedTables.forEach(refTable => {
        // ... and their fields ...
        refTable.fields
          .filter(refField => {
            // ... and if the field is not in the list of our fields ...
            let isMatchingField = !fields.some(
              f => f.fieldName === refField.fieldName
            );

            // ... and if options object is defined - we never copy ALL fields ...
            isMatchingField = isMatchingField && !!refField.options;

            if (isMatchingField) {
              // ... and has all necessary options defined ...
              rule.fieldOptions.forEach(fo => {
                isMatchingField = isMatchingField && !!refField.options[fo];
              });
            }

            return isMatchingField;
          })
          // ... we will clone it and push to our list
          .forEach(refField => {
            // we need a "deep clone" here, so that we don't affect the original field
            const newField = deepClone(refField);

            if (rule.unsetOptions && newField.options) {
              rule.unsetOptions.forEach(unsetOption => {
                delete newField.options[unsetOption];
              });

              // let's pass our modified clone through constructor and validation
              fields.push(new Field(newField));
            }
          });
      });
    });
  }
  return table;
}

/**
 * addon options default values
 * @property {CopyFieldsRule[]} rules Array of `CopyFieldsRule` to be applied
 */
const defaults = {
  rules: []
};

/**
 * creates an instance of addon
 * @param {Object} options addon options (usually specified in the project
 *   file). See {@link module:latona/addons/latona-core-copy-fields} for
 *   details.
 * @param {function} addonCreateCb callback that returns an instance
 *   of `LatonaAddon`
 * @returns {LatonaAddon}
 */
const create = (options, addonCreateCb) => {
  const opt = Object.assign({}, defaults, options);

  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }

  const validateOptions = () => {
    const { isEmptyArray, isArray } = validateArray(opt.rules);
    if (!isArray || isEmptyArray) {
      throw new Error("rules option should be non-empty array");
    }
  };

  validateOptions();

  const addon = addonCreateCb(
    "latona-core-copy-fields",
    "Latona Core - Copy fields from referenced table into referencing table"
  );

  addon.addModelTransformation(model => {
    const rules = opt.rules.map(rule => new CopyFieldsRule(rule));

    // eslint-disable-next-line no-param-reassign
    model.tables = model.tables.map(table =>
      copyReferencedFields(table, rules)
    );

    return model;
  });

  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
