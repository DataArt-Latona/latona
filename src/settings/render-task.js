const { validateFunction } = require("../utils/validation");

/**
 * RenderTask class.
 * Creates `renderTask` setting item and provides validation.
 * @typedef {Object} RenderItem
 * @property {string} fileName file to render (relative to project location)
 * @property {Object} model model to pass to the rendering function (should match
 *   template expectations)
 * @property {Object[]} [partials] mustache partials
 */

/**
 * Render items generator callback
 * @callback renderItemsCallback
 * @param {Model} model Reference to the latona model object
 * @returns {RenderItem[]}
 */

/**
 * RenderTask class.
 * Creates `renderTask` setting item and provides validation.
 *
 * @property {string} template path to template file
 * @property {renderItemsCallback} itemsBuilder path to template file
 */
class RenderTask {
  /**
   * @param {Object} options
   * @param {string} options.template
   * @param {Object} options.itemsBuilder
   */
  constructor(options = {}) {
    const { template, itemsBuilder } = options;

    this.validateTemplate(template);
    this.validateItemsBuilder(itemsBuilder);

    Object.entries(options).forEach(([k, v]) => {
      this[k] = v;
    });
  }

  /**
   * Ensures that `template` property exists and is a string
   * @param {string} template A path to *.mustache template
   * @return {boolean}
   * @private
   */
  validateTemplate(template) {
    if (!template || typeof template !== "string") {
      throw new Error(`"template" property must be specified and be a string`);
    }

    return true;
  }

  /**
   * Ensures that `itemsBuilder` property exists and is a function
   * @param {!Function} itemsBuilder Creates an array of items to build
   * @return {boolean}
   * @private
   */
  validateItemsBuilder(itemsBuilder) {
    const { isFunction } = validateFunction(itemsBuilder);

    if (!isFunction) {
      throw new Error(
        `"itemsBuilder" property must be specified and be a function`
      );
    }

    return true;
  }
}

module.exports = { RenderTask };
