/**
 * @fileoverview This module is a fully-functional latona addon module
 *   Key feature - 2 pre-processing tasks and 2 rendering tasks
 */

const path = require("path");
const { writeJSONSync } = require("fs-extra");

const defaults = {
  otherScope: "other",
  dimScope: "dim",
  factScope: "fact",
  optionName_isNKey: "isNKey",
  templatePath: __dirname,
  outPath: "../../output/latona-cli.spec"
};

const create = (options, addonCreateCb) => {
  if (!addonCreateCb || typeof addonCreateCb !== "function") {
    throw new Error(`"addonCreateCb" is expected to be a function`);
  }

  const opt = Object.assign({}, defaults, options);
  const addon = addonCreateCb("testAddon_01", "Test Addon 01");
  addon
    .addModelMixin({
      testDimTables() {
        return this.tables.filter(table => table.tableScope === opt.dimScope);
      },
      testFactTables() {
        return this.tables.filter(table => table.tableScope === opt.factScope);
      }
    })
    .addTableMixin(
      {
        testIsDim() {
          return this.tableScope === opt.dimScope;
        },
        testIsFact() {
          return this.tableScope === opt.factScope;
        }
      },
      obj => {
        return (
          obj &&
          (obj.tableScope === opt.dimScope || obj.tableScope === opt.factScope)
        );
      }
    )
    .addFieldMixin({
      testIsPublic() {
        return !!this.options && !!this.options.isPublic;
      }
    })
    .addSourceDataSetMixin(
      {
        isPrivate() {
          return !this.isPublic;
        }
      },
      obj => {
        return obj && !obj.isPublic;
      }
    )
    .addModelTransformation(model => {
      // eslint-disable-next-line no-param-reassign
      model.transformFlag01 = "set";
      // eslint-disable-next-line no-param-reassign
      model.transformFlag = "01";
      return model;
    })
    .addPreprocessingTask(proj => {
      const outPath = path.resolve(proj.getResolvedProjectPath(), opt.outPath);
      writeJSONSync(`${outPath}/preprocess01.json`, {
        modelFileName: proj.modelFileName
      });
    })
    .addPreprocessingTask(proj => {
      const outPath = path.resolve(proj.getResolvedProjectPath(), opt.outPath);
      writeJSONSync(`${outPath}/preprocess02.json`, {
        modelFileName: proj.modelFileName
      });
    })
    .addRenderTask({
      template: `${opt.templatePath}/template.mustache`,
      itemsBuilder: model => {
        const items = [];
        const paramsMessage = "Param renders correctly!";

        items.push({
          fileName: `${opt.outPath}/template.txt`,
          model: { dataSet: { paramsMessage } }
        });

        return items;
      }
    })
    .addRenderTask({
      template: `${opt.templatePath}/tables.mustache`,
      itemsBuilder: model => {
        const items = [];

        items.push({
          fileName: `${opt.outPath}/tables.txt`,
          model: { tables: model.tables }
        });

        return items;
      }
    });
  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
