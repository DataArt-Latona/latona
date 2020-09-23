/**
 * This **Latona Addon** module adds essential helpers that simplify accessing
 *   tables and fields by their roles. See addon documentation for more details.
 *
 * (Note: please use this module as a part of the project composition)
 *
 * @module latona/addons/latona-core-dimensional
 */
const { validateStringNotEmpty } = require("../utils/validation");
const { cloneArrayAndSetIsLast } = require("../utils/array");

/**
 * addon options default values
 * @property {string} tableScopeValueDim default = "dim"
 * @property {string} tableScopeValueFact default = "fact"
 * @property {string} tableScopeValueRaw default = "raw"
 * @property {string} tableScopeValueOther default = "other"
 * @property {string} tableOptionInternal default = "isInternal"
 * @property {string} fieldOptionNaturalKey default = "isNKey"
 * @property {string} fieldOptionSurrogateKey default = "isSKey"
 * @property {string} fieldOptionVersionKey default = "isVKey"
 * @property {string} fieldOptionPublicField default = "isPublic"
 * @property {string} fieldOptionIndexField default = "isIndex"
 * @property {string} fieldOptionPersistentField default = "isPersistent"
 * @property {string} fieldOptionVersionedField default = "isVersioned"
 */
const defaults = {
  tableScopeValueDim: "dim",
  tableScopeValueFact: "fact",
  tableScopeValueRaw: "raw",
  tableScopeValueOther: "other",
  tableOptionInternal: "isInternal",
  fieldOptionNaturalKey: "isNKey",
  fieldOptionSurrogateKey: "isSKey",
  fieldOptionVersionKey: "isVKey",
  fieldOptionPublicField: "isPublic",
  fieldOptionIndexField: "isIndex",
  fieldOptionPersistentField: "isPersistent",
  fieldOptionVersionedField: "isVersioned"
};

/**
 * creates an instance of addon
 * @param {Object} options addon options (usually specified in the project
 *   file). See {@link module:latona/addons/latona-core-dimensional} for
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
    const keys = Object.getOwnPropertyNames(defaults);

    keys.forEach(key => {
      if (!validateStringNotEmpty(opt[key])) {
        throw new Error(`"${key}" setting is expected to be non-empty string`);
      }
    });
  };

  validateOptions();

  const addon = addonCreateCb(
    "latona-core-dimensional",
    "Latona Core - Dimensional Helpers"
  );

  addon
    .addFieldMixin({
      isNaturalKey() {
        return !!this.options && !!this.options[opt.fieldOptionNaturalKey];
      },
      isSurrogateKey() {
        return !!this.options && !!this.options[opt.fieldOptionSurrogateKey];
      },
      isVersionKey() {
        return !!this.options && !!this.options[opt.fieldOptionVersionKey];
      },
      isPublic() {
        return !!this.options && !!this.options[opt.fieldOptionPublicField];
      },
      isIndexField() {
        return !!this.options && !!this.options[opt.fieldOptionIndexField];
      },
      isPersistentField() {
        return !!this.options && !!this.options[opt.fieldOptionPersistentField];
      },
      isVersionedField() {
        return !!this.options && !!this.options[opt.fieldOptionVersionedField];
      }
    })
    .addTableMixin({
      isDimension() {
        return this.tableScope === opt.tableScopeValueDim;
      },
      isFact() {
        return this.tableScope === opt.tableScopeValueFact;
      },
      isRaw() {
        return this.tableScope === opt.tableScopeValueRaw;
      },
      isOther() {
        return this.tableScope === opt.tableScopeValueOther;
      },
      isInternal() {
        return !!this.options && !!this.options[opt.tableOptionInternal];
      },
      naturalKeyFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isNaturalKey())
        );
      },
      surrogateKeyFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isSurrogateKey())
        );
      },
      versionKeyFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isVersionKey())
        );
      },
      publicFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isPublic())
        );
      },
      indexFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isIndexField())
        );
      },
      persistentFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isPersistentField())
        );
      },
      nonPersistentFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => !field.isPersistentField())
        );
      },
      versionedFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(field => field.isVersionedField())
        );
      },
      persistentUnversionedFields() {
        return cloneArrayAndSetIsLast(
          this.fields.filter(
            field => field.isPersistentField() && !field.isVersionedField()
          )
        );
      }
    })
    .addModelMixin({
      publicTables() {
        return this.tables.filter(table => !table.isInternal());
      },
      internalTables() {
        return this.tables.filter(table => table.isInternal());
      },
      dimensionTables() {
        return this.tables.filter(table => table.isDimension());
      },
      factTables() {
        return this.tables.filter(table => table.isFact());
      },
      rawTables() {
        return this.tables.filter(table => table.isRaw());
      },
      otherTables() {
        return this.tables.filter(table => table.isOther());
      }
    });

  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
