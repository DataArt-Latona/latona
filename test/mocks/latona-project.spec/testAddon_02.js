/**
 * @fileoverview This module is a fully-functional latona addon module.
 *   Key feature - pre-processing throws error
 */

const defaults = {
  otherScope: "other",
  dimScope: "dim",
  factScope: "fact",
  optionName_isNKey: "isNKey"
};

const create = (options, addonCreateCb) => {
  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }

  const opt = Object.assign({}, defaults, options);
  const addon = addonCreateCb("testAddon_02", "Test Addon 02");
  addon
    .addModelMixin(
      {
        testDimTables02() {
          return this.tables.filter(table => table.tableScope === opt.dimScope);
        },
        testFactTables02() {
          return this.tables.filter(
            table => table.tableScope === opt.factScope
          );
        }
      },
      (obj, model, table, field) => {
        return model && obj && obj.tables.length > 0;
      }
    )
    .addTableMixin(
      {
        testIsDim02() {
          return this.tableScope === opt.dimScope;
        },
        testIsFact02() {
          return this.tableScope === opt.factScope;
        }
      },
      (obj, model, table, field) => {
        return model && table && obj && obj.tableName === "FactTable";
      }
    )
    .addTableMixin({
      alwaysTrue() {
        return true;
      }
    })
    .addFieldMixin(
      {
        testIsPublic02() {
          return this.options && this.options.isPublic;
        }
      },
      (obj, model, table, field) => {
        return (
          obj && model && table && field && table.tableScope === opt.dimScope
        );
      }
    )
    .addSourceDataSetMixin(
      {
        isPrivate02() {
          return !this.isPublic;
        }
      },
      (obj, model, table, field, sourceDataSet) => {
        return obj && !model && sourceDataSet && !obj.isPublic;
      }
    )
    .addModelTransformation(model => {
      // eslint-disable-next-line no-param-reassign
      model.transformFlag02 = "set";
      // eslint-disable-next-line no-param-reassign
      model.transformFlag = "02";
      return model;
    })
    .addPreprocessingTask(proj => {
      throw new Error("pre-processing failed");
    });

  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
