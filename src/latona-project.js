/**
 * @fileoverview This module defines the `LatonaProject` class. We rely on
 *   dynamic require for Latona extensibility.
 */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const path = require("path");
const process = require("process");
const resolve = require("resolve");
const {
  validateArray,
  validateFunction,
  validateObject,
  validateStringNotEmpty
} = require("./utils/validation");
const { LatonaAddon } = require("./latona-addon");
const { Model } = require("./model");
const { deepClone } = require("./utils/object");
const {
  checkPathIsRelative,
  joinPathAndCheck,
  checkPathExistsOrThrow
} = require("./utils/fs");
const { readJSONFile } = require("./utils/io");
const { renderAndSave } = require("./utils/template");
const { jsonStringifyAndSave } = require("./utils/json");
const { logger } = require("./utils/winstonLogger");

const latonaCoreSlugPrefix = "latona-core-";

/**
 * Represents addon module options. Use Latona project to load these from a
 *   project file. We expect the addon module to export:
 *
 *   - builder function -
 *     `const create = (options, addonCreateCb) => {@link LatonaAddon}`
 *   - object that outlines addon default options - `const defaults = {...}`
 *
 * @class
 * @property {string} moduleName Module name to be used by `require` to get the
 *   addon builder function. If the `moduleName` starts with
 *
 *   - `latona-core-` string - it will be considered as the built-in addon (i.e.
 *     should be in the latona's `./src/addons` folder)
 *   - `./` or `../` - it  will be considered as a custom addon and will be
 *     combined with the project file location.
 *   - Otherwise general rules for `require` will apply (see
 *     [Node.js documentation](https://nodejs.org/api/modules.html#modules_file_modules)
 *     for more details). Note: we will use project file location as the basis
 *     for resolution.
 *
 * @property {Object} options An object containing addon-specific options.
 */
class AddonModuleReference {
  /**
   * Creates an instance of the `AddonModuleReference` class
   * @param {Object} reference reference details
   * @param {string} reference.moduleName module name (see properties
   *   description)
   * @param {Object} [reference.options] An object containing addon-specific
   *   options.
   * @param {string} projectPath project working directory - will be used to
   *   resolve relative paths to addons modules.
   */
  constructor(reference, projectPath) {
    const { isDefined: isRefDefined, isObject: isRefObject } = validateObject(
      reference
    );

    if (!isRefDefined || !isRefObject) {
      throw new Error(`"reference" should be an object`);
    }

    if (!validateStringNotEmpty(projectPath)) {
      throw new Error(`"projectPath" should be non-empty string`);
    }

    checkPathExistsOrThrow(projectPath, `Can't find path ${projectPath}`);

    const { moduleName, options } = reference;
    const { isDefined: isOptDefined, isObject: isOptObject } = validateObject(
      options
    );

    if (!validateStringNotEmpty(moduleName)) {
      throw new Error(`"moduleName" should be non-empty string`);
    }

    if (isOptDefined && !isOptObject) {
      throw new Error(`"options" should be an object if defined`);
    }

    logger.info(`Initializing addon reference for "${moduleName}"`);
    let moduleFilePath = moduleName;

    // If module name starts with `latona-core-`, then we think it is our
    // built-in addon (though we may be wrong... we'll see how it goes in 20
    // lines or so ;) )
    if (moduleFilePath.toLowerCase().startsWith(latonaCoreSlugPrefix)) {
      moduleFilePath = `./addons/${moduleFilePath}`;
    }
    // relative paths - we'll force .js extensions for now
    // this may be reconsidered in future if someone needs other options
    // for addons
    else if (checkPathIsRelative(moduleFilePath)) {
      let ext = ".js";
      if (moduleFilePath.toLowerCase().endsWith(ext)) {
        ext = "";
      }

      moduleFilePath = joinPathAndCheck(projectPath, `${moduleFilePath}${ext}`);
    } else {
      try {
        moduleFilePath = resolve.sync(moduleName, {
          basedir: projectPath
        });
      } catch (err) {
        logger.info(
          `Failed to resolve '${moduleName}' against project location - will try standard resolution.`
        );
      }
    }

    let moduleExportObject;
    try {
      moduleExportObject = require(moduleFilePath);
    } catch (error) {
      throw new Error(`Failed to load module "${moduleFilePath}": ${error}`);
    }

    if (!validateFunction(moduleExportObject.create).isFunction) {
      throw new Error("Addon module is expected to export `create` function");
    }

    this.moduleName = moduleName;
    this.options = options;

    try {
      // we encapsulate the addon to func to avoid serialization
      // TODO: (?) implement nice and shiny toJSON() method
      const addonObject = moduleExportObject.create(
        options,
        LatonaAddon.create
      );

      if (addonObject === undefined) {
        throw new Error("create hasn't returned anything");
      }

      if (!(addonObject instanceof LatonaAddon)) {
        throw new Error(
          `create hasn't returned an instance of LatonaAddon (got ${typeof addonObject})`
        );
      }

      this.getAddonObjectInternal = () => {
        return addonObject;
      };
    } catch (error) {
      throw new Error(
        `Failed to create addon object from "${moduleFilePath}": ${error}`
      );
    }

    logger.info(`Addon reference created for "${moduleName}"`);
  }

  /**
   * Instantiates {@link LatonaAddon} object based on the given options.
   *   This method will call addon modules to get proper addon objects.
   * @returns {LatonaAddon}
   */
  getAddonObject() {
    return this.getAddonObjectInternal();
  }
}

/**
 * Provides API for latona projects, which glue together Latona Model and Latona
 *   Addons. With the latona project you define the composition of addons (that
 *   are used to deliver technology-specific templates, rendering tasks, model
 *   enhancements and transformations). Please note that the sequence of addon
 *   references matters as functional elements will be applied sequentially in
 *   this order:
 *
 *   1. All mix-ins defined by addon are applied to model entities
 *   2. All model transformations defined by addon are applied to a model
 *   3. Repeat for the next addon.
 *
 *Rendering happens as follows:
 *
 *   1. All pre-render (pre-processing) tasks are executed (in order of
 *   appearance)
 *   2. All render tasks are executed (in order of appearance)
 *
 *   **Important:** Please note that all relative paths will be
 *   resolved against project file location (when loaded from file) or
 *   provided path (when loaded from object) or `process.cwd()` if none of the
 *   above is available. These paths include: model reference, addon modules
 *   references, paths to output/rendered files (as generated by addons).
 *
 * @property {string} modelFileName
 * @property {AddonModuleReference[]} addonModuleReferences Array of addon
 *   module references (see {@link AddonModuleReference})
 * @property {LatonaAddon[]} addonObjects Instances of addon objects.
 *   `LatonaProject` will call addon modules to get proper addon objects as a
 *   part of the project load process.
 */
class LatonaProject {
  /**
   * Creates an instance of the `LatonaProject` class. Usually you don't need
   *   to call this - use `load` or `loadFromFile` static methods instead.
   * @param {string} modelFileName Path to the project's model file (JSON).
   * @param {string} projectPath project working directory - will be used to
   *   resolve all paths to addons, rendered files, etc.
   * @param {Object} loggerSettings logger settings
   */
  constructor(modelFileName, projectPath, loggerSettings) {
    if (!validateStringNotEmpty(modelFileName)) {
      throw new Error(`"modelFileName" should be non-empty string`);
    }

    if (!validateStringNotEmpty(projectPath)) {
      throw new Error(`"projectPath" should be non-empty string`);
    }

    this.modelFileName = modelFileName;
    this.addonModuleReferences = [];
    this.loggerSettings = loggerSettings;

    if (this.loggerSettings) {
      logger.init(this.loggerSettings);
    }

    /**
     * Returns the full resolved path to the project folder , may be used by
     *   addons for resolving project-based paths at pre-processing time.
     * @returns {string}
     */
    this.getResolvedProjectPath = () => {
      return path.resolve(process.cwd(), projectPath);
    };

    /**
     * Returns the full resolved path to the model file, may be used by addons
     *   for resolving model-based at pre-processing time. (Not recommended -
     *   consider using project-based paths.)
     * @returns {string}
     */
    this.getResolvedModelFileName = () => {
      return path.resolve(this.getResolvedProjectPath(), this.modelFileName);
    };

    checkPathExistsOrThrow(
      this.getResolvedProjectPath(),
      `Can't find path ${this.getResolvedProjectPath()}`
    );
    checkPathExistsOrThrow(
      this.getResolvedModelFileName(),
      `Can't find file ${this.getResolvedModelFileName()}`
    );
  }

  /**
   * Adds addon reference to the project. Adding `LatonaAddon` objects directly
   *  is not supported by this version. Usually you don't need to call this -
   *  use `load` or `loadFromFile` static methods instead.
   * @param {Object} addonModuleReference Object containing [addon reference
   *   details]{@link AddonModuleReference}
   * @returns {LatonaProject}
   */
  addAddon(addonModuleReference) {
    if (!(addonModuleReference instanceof AddonModuleReference)) {
      throw new Error(
        "addonModuleReference should be an instance of AddonModuleReference"
      );
    }
    this.addonModuleReferences.push(addonModuleReference);
  }

  /**
   * Saves Latona Project to file.
   * @param {string} fileName path to the project file. The file will be
   * overwritten if exists.
   */
  saveToFile(fileName) {
    try {
      logger.info(`Saving project to "${fileName}"`);
      jsonStringifyAndSave(
        {
          model: this.modelFileName,
          addons: this.addonModuleReferences,
          logger: this.loggerSettings
        },
        fileName
      );
      logger.info(`Success!`);
    } catch (error) {
      const msg = `Failed to save project to "${fileName}" (${error})`;
      logger.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * Get original model object
   * @returns {Model}
   */
  get model() {
    if (this.getModelInternal === undefined) {
      const resolvedModelFileName = this.getResolvedModelFileName();

      try {
        logger.info(`Loading model from file "${resolvedModelFileName}"`);

        const modelJSON = readJSONFile(resolvedModelFileName);

        const model = new Model(modelJSON);

        this.getModelInternal = () => {
          return model;
        };
      } catch (error) {
        throw new Error(
          `Failed to load model from file "${resolvedModelFileName}": ${error}`
        );
      }
    }

    return this.getModelInternal();
  }

  /**
   * Get the "transformed" model object (with all mix-ins and transformations
   *   applied)
   * @returns {Model}
   */
  get transformedModel() {
    const applyMixin = (mixin, obj, model, table, field, sourceDS) => {
      if (
        !mixin.hasFilter ||
        mixin.filter(obj, model, table, field, sourceDS)
      ) {
        Object.assign(obj, mixin.mixin, obj);
      }

      return model;
    };

    let modelClone = new Model(deepClone(this.model));

    // apply mixins (model, table, field, source data set)
    this.addonModuleReferences.forEach(addonRef => {
      const addonObj = addonRef.getAddonObject();

      // execute "start" model transformations
      logger.info(
        `Running "start" model transformations from "${addonRef.moduleName}"`
      );
      addonObj.startModelTransformations.forEach(modelTransform => {
        if (!validateFunction(modelTransform).isFunction) {
          throw new Error("model transformation is expected to be a function");
        }

        modelClone = modelTransform(modelClone, this);
      });

      logger.info(`Applying mixins from "${addonRef.moduleName}"`);
      addonObj.modelMixins.forEach(mixin => {
        // process model mixins
        applyMixin(mixin, modelClone, modelClone);
      });

      addonObj.tableMixins.forEach(mixin => {
        // process table mixins
        modelClone.tables.forEach(table => {
          applyMixin(mixin, table, modelClone, table);
        });
      });

      addonObj.fieldMixins.forEach(mixin => {
        // process field mixins
        modelClone.tables.forEach(table => {
          table.fields.forEach(field => {
            applyMixin(mixin, field, modelClone, table, field);
          });
        });
      });

      addonObj.sourceDataSetMixins.forEach(mixin => {
        // process sourceDataSet mixins
        modelClone.sourceDataSets.forEach(sourceDS => {
          applyMixin(
            mixin,
            sourceDS,
            modelClone,
            undefined,
            undefined,
            sourceDS
          );
        });
      });

      // execute "end" model transformations
      logger.info(
        `Running "end" model transformations from "${addonRef.moduleName}"`
      );
      addonObj.endModelTransformations.forEach(modelTransform => {
        if (!validateFunction(modelTransform).isFunction) {
          throw new Error("model transformation is expected to be a function");
        }

        modelClone = modelTransform(modelClone, this);
      });
    });

    return modelClone;
  }

  /**
   * Renders code artifacts as specified by model and addon composition. See
   *   {@link LatonaProject} for more details.
   *   Please note that this function runs in SYNC mode, thus all callbacks
   *   provided by addons should by synchronous!
   */
  render() {
    logger.info("Starting rendering sequence");

    // loops through addon refs and gets addon obj
    const iterateAddons = (addonRefs, model, callback) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const addonRef of addonRefs) {
        const addonObj = addonRef.getAddonObject();
        // eslint-disable-next-line no-await-in-loop
        callback(addonObj, model);
      }
    };

    // callback that executes addon's pre-processing tasks
    const execPreprocessingTasks = addon => {
      const { isArray, isEmptyArray } = validateArray(addon.preprocessingTasks);

      if (isArray && !isEmptyArray) {
        logger.info(`Executing pre-processing tasks for ${addon.name}`);
        addon.preprocessingTasks.forEach(task => {
          if (!validateFunction(task).isFunction) {
            const msg = "Pre-processing task is expected to be a function";
            logger.error(msg);
            throw new Error(msg);
          }

          try {
            task(this);
          } catch (error) {
            const msg = `Pre-processing task failed: ${error}`;
            logger.error(msg);
            throw new Error(msg);
          }
        });
      }
    };

    // callback that executes addon's render tasks
    const execRenderTasks = (addon, model) => {
      const { renderTasks } = addon;

      const {
        isArray: renderTasksIsArray,
        isEmptyArray: renderTasksIsEmptyArray
      } = validateArray(renderTasks);

      if (!renderTasksIsArray || renderTasksIsEmptyArray) {
        logger.info(`Render tasks NOT provided by ${addon.name}`);
      } else {
        logger.info(`Executing render tasks for ${addon.name}`);

        // eslint-disable-next-line no-restricted-syntax
        for (const task of renderTasks) {
          const { template, itemsBuilder } = task;
          const items = itemsBuilder(model);

          if (items) {
            // eslint-disable-next-line no-restricted-syntax
            for (const item of items) {
              const { fileName, model: itemModel, partials } = item;
              const resolvedFileName = path.resolve(
                this.getResolvedProjectPath(),
                fileName
              );
              renderAndSave(template, itemModel, partials, resolvedFileName);
            }
          }
        }
      }
    };

    // TODO: Check addon dependencies

    try {
      // Get transformed model
      const tModel = this.transformedModel;

      // Run pre-processing tasks
      iterateAddons(this.addonModuleReferences, tModel, execPreprocessingTasks);
      logger.info("Done with pre-processing tasks");
      iterateAddons(this.addonModuleReferences, tModel, execRenderTasks);
      logger.info("Done with render tasks");
    } catch (error) {
      const msg = `Render failed: ${error}`;
      logger.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * Creates an instance of the `LatonaProject` from the given object
   * @param {Object} project Object with the de-serialized representation of the
   *   Latona Project
   * @param {string} project.model Path to the project's model file (JSON).
   *   The path may be relative to the project file location.
   * @param {Object[]} project.addons Array of addon references (see
   *   {@link AddonModuleReference})
   * @param {Object} project.logger Logger settings
   * @param {string} project.logger.runtimeLogsFilePath Path to runtime log file
   * @param {string} project.logger.exceptionsLogsFilePath Path to exceptions
   *   log file
   * @param {boolean} project.logger.disableLogToConsole Path to exceptions
   * @param {string} projectPath Path to be used as the base for resolving all
   *   paths within project
   * @returns {LatonaProject}
   */
  static load(project, projectPath = undefined) {
    const { model, addons, logger: loggerSettings } = project;

    if (!validateStringNotEmpty(model)) {
      throw new Error(`"project.model" should be non-empty string`);
    }

    const { isArray: isAddonsArray } = validateArray(addons);
    if (!isAddonsArray) {
      throw new Error(`"project.addons" should be array`);
    }

    const projectWorkDir = validateStringNotEmpty(projectPath)
      ? projectPath
      : process.cwd();

    try {
      const latonaProject = new LatonaProject(
        model,
        projectWorkDir,
        loggerSettings
      );

      logger.info("Project object created, now reading addons");

      addons.forEach(addon => {
        const addonRef = new AddonModuleReference(
          addon,
          latonaProject.getResolvedProjectPath()
        );
        latonaProject.addAddon(addonRef);
      });

      return latonaProject;
    } catch (error) {
      throw new Error(`Failed to load project: ${error}`);
    }
  }

  /**
   * Creates an instance of the `LatonaProject` from the given JSON file
   * @param {string} projectFileName Path to the project file
   * @returns {LatonaProject}
   */
  static loadFromFile(projectFileName) {
    if (!validateStringNotEmpty(projectFileName)) {
      throw new Error(`"projectFileName" should be non-empty string`);
    }

    checkPathExistsOrThrow(
      projectFileName,
      `Can't find file ${projectFileName}`
    );

    const resolvedProjectFileName = path.resolve(
      process.cwd(),
      projectFileName
    );

    const projectDirName = path.dirname(resolvedProjectFileName);

    try {
      const projectObj = readJSONFile(projectFileName);
      const latonaProj = LatonaProject.load(projectObj, projectDirName);
      return latonaProj;
    } catch (error) {
      throw new Error(
        `Failed to load project from file "${projectFileName}": ${error}`
      );
    }
  }
}

module.exports = { LatonaProject, AddonModuleReference };
