/**
 * @fileoverview Utility for working with *.mustache templates.
 * @private
 */

const Mustache = require("mustache");
const { outputFileSync } = require("fs-extra");

const { readTxtFile } = require("./io");
const { logger } = require("./winstonLogger");

/**
 * Renders *.mustache template
 * @param {string} templateFile Path to *.mustache template file
 * @param {Model} [model] A Model instance
 * @param {Object} [partials] An object of partials
 * @return {string}
 * @private
 */
const render = (templateFile, model = {}, partials = {}) => {
  logger.info("Start rendering template", { template: templateFile });

  try {
    const template = readTxtFile(templateFile);

    logger.info("Template successfully rendered", { template: templateFile });

    return Mustache.render(template, model, partials);
  } catch (error) {
    throw error;
  }
};

/**
 * Renders *.mustache template and saves it to output file
 * @param {string} templateFile Path to *.mustache template file
 * @param {Model} [model] A Model instance
 * @param {string[]} [partialsList] An array of partials
 * @param {string} outFile Path to output file
 * @return {void}
 * @private
 */
const renderAndSave = (
  templateFile,
  model = {},
  partialsList = [],
  outFile
) => {
  try {
    const partialTemplates = partialsList.map(partial =>
      readTxtFile(partial.path)
    );

    const partials = partialsList
      .map((partial, index) => {
        return {
          ...partial,
          template: partialTemplates[index]
        };
      })
      .reduce((memo, partial) => {
        const { name, template } = partial;

        return {
          ...memo,
          [name]: template
        };
      }, {});

    const templateResult = render(templateFile, model, partials);

    outputFileSync(outFile, templateResult);

    logger.info("Template successfully rendered and saved", {
      template: templateFile,
      outFile
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  render,
  renderAndSave
};
