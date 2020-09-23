/**
 * @fileoverview Utility for working with JSON data and .json files.
 * @private
 */

const { writeJsonSync } = require("fs-extra");

const { logger } = require("./winstonLogger");

/**
 * @param  {!Object} obj A JS object to convert to JSON
 * @param  {(null | !Array | !Function)=} replace
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#The_replacer_parameter
 * @param  {number=} space A spaces padding
 * @return {!Object} JSON
 * @private
 */
const jsonStringify = (obj, replace = null, space = 2) => {
  try {
    return JSON.stringify(obj, replace, space);
  } catch (error) {
    throw error;
  }
};

/**
 * @param  {!Object} obj A JS object to convert to JSON
 * @param  {string} outFilePath A path to output .json file
 * @param  {!Object} options
 * @see https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/writeJson.md
 * @return {!Promise}
 * @private
 */
const jsonStringifyAndSave = (obj, outFilePath, options = { spaces: 2 }) => {
  if (!outFilePath) {
    throw new Error(`"outFilePath" param is required`);
  }

  logger.info("Start saving JSON object to file", { file: outFilePath });

  try {
    writeJsonSync(outFilePath, obj, options);
    logger.info("JSON object saved to file", { file: outFilePath });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  jsonStringify,
  jsonStringifyAndSave
};
