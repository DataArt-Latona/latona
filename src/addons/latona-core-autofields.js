/**
 * This **Latona Addon** module allows the automated creation of table fields
 *   based on predefined naming conventions. Typical use cases are: identifiers,
 *   keys, time or version stamps, etc.
 *
 * (Note: please use this module as a part of the project composition)
 *
 * @module latona/addons/latona-core-autofields
 */
const { validateArray } = require("../utils/validation");
const { AutoFieldTemplate } = require("../settings/auto-field-template");
const { Field } = require("../field");

/**
 * Adds auto generated fields to table from user provided settings
 * @param {Object} table Table instance
 * @param {AutoFieldTemplate[]} autoFieldTemplates Field templates
 * @return {Table}
 * @private
 */
function createTableAutoFields(table, autoFieldTemplates) {
  const { tableName, tableScope, keyPrefix, options, fields } = table;

  const matchingTemplates = autoFieldTemplates.filter(template => {
    const {
      tableOption: templateTableOption,
      tableScope: templateTableScope
    } = template;

    const templateMatchersNotSpecified =
      !templateTableOption && !templateTableScope;

    const tableOptionMatches = Object.prototype.hasOwnProperty.call(
      options,
      templateTableOption
    );

    const tableScopeMatches =
      tableScope === templateTableScope || templateTableScope === undefined;

    return (
      templateMatchersNotSpecified ||
      ((tableOptionMatches || !templateTableOption) &&
        (tableScopeMatches || !templateTableScope))
    );
  });

  matchingTemplates.forEach(template => {
    const { addKeyPrefix, fieldTemplate } = template;
    const { fieldName: templateFieldTemplate } = fieldTemplate;

    if (addKeyPrefix && !keyPrefix) {
      throw new Error(
        `"keyPrefix" property is missing for table "${tableName}"`
      );
    }

    const fieldName = addKeyPrefix
      ? `${keyPrefix}${templateFieldTemplate}`
      : templateFieldTemplate;

    const fieldExists = fields.some(field => field.fieldName === fieldName);

    if (fieldExists) {
      throw new Error(
        `${fieldName} is already specified in "${tableName}" table`
      );
    }

    const field = {
      options: {},
      ...fieldTemplate,
      fieldName
    };

    field.options.isAutoAdded = true;

    const newField = new Field(field);

    /* eslint-disable-next-line no-param-reassign */
    table.fields.push(newField);
  });

  return table;
}

/**
 * addon options default values
 * @property {AutoFieldTemplate[]} fieldTemplates This array is empty by
 *   default, however addon object creation will fail if templates are not
 *   provided.
 */
const defaults = {
  fieldTemplates: []
};

/**
 * creates an instance of addon
 * @param {Object} options addon options (usually specified in the project
 *   file). See {@link module:latona/addons/latona-core-autofields} for
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
    const { isEmptyArray, isArray } = validateArray(opt.fieldTemplates);
    if (!isArray || isEmptyArray) {
      throw new Error("fieldTemplates option should be non-empty array");
    }
  };

  validateOptions();

  const addon = addonCreateCb(
    "latona-core-autofields",
    "Latona Core - Auto Fields model transformer"
  );

  addon.addModelTransformation(model => {
    const templates = opt.fieldTemplates.map(
      template => new AutoFieldTemplate(template)
    );

    // eslint-disable-next-line no-param-reassign
    model.tables = model.tables.map(table =>
      createTableAutoFields(table, templates)
    );

    return model;
  });

  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
