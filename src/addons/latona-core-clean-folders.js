/**
 * This **Latona Addon** module provides the pre-processing task for folders
 * cleanup.
 *
 * (Note: please use this module as a part of the project composition)
 *
 * @module latona/addons/latona-core-clean-folders
 */
const { cleanDirectory } = require("../utils/fs");
const { validateArray } = require("../utils/validation");
const { logger } = require("../utils/winstonLogger");

/**
 * addon options default values
 * @property {string[]} foldersToClean mandatory array of strings.
 *   Folder may be missing at render time. Empty by default.
 */
const defaults = {
  foldersToClean: []
};

/**
 * creates an instance of addon
 * @param {Object} options addon options (usually specified in the project
 *   file). See {@link module:latona/addons/latona-core-clean-folders} for
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
    const { isArray, isEmptyArray, isArrayOfStrings } = validateArray(
      opt.foldersToClean
    );

    if (!isArray || isEmptyArray || !isArrayOfStrings) {
      const msg = "'foldersToClean' is expected to be an array of strings";
      logger.error(msg);
      throw new Error(msg);
    }
  };

  validateOptions();

  const addon = addonCreateCb(
    "latona-core-clean-folders",
    "Latona Core - Clean Folders (cleans folders specified in the 'foldersToClean' array"
  );
  addon.addPreprocessingTask(() => {
    validateOptions();

    logger.info(`Start cleaning folders...`);
    opt.foldersToClean.forEach(folderPath => {
      logger.info(`Cleaning "${folderPath}"`);
      cleanDirectory(folderPath);
    });
  });
  return addon;
};

module.exports.create = create;
module.exports.defaults = defaults;
