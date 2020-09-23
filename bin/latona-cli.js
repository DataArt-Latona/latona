#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Latona CLI - provides command line interface for the Latona framework.
 *
 * TODO: override logging settings for validation and rendering
 * TODO: quite mode
 */
const chalk = require("chalk");
const { Command } = require("commander");
const path = require("path");
const fs = require("fs-extra");
const packageJson = require("../package.json");
const { jsonStringifyAndSave } = require("../src/utils/json");
const latona = require("../index");

const modelBlank = require("../examples/model/blank-model.json");
const modelSample = require("../examples/model/sample-model.json");
const projectBlank = require("../examples/project/blank-project.json");
const projectSample = require("../examples/project/sample-project.json");

const addonSamplePath = path.resolve(
  __dirname,
  "../examples/addon/sample-addon.js"
);

function trimOptions(opt, props) {
  const trimmedOpt = {};

  props.forEach(element => {
    trimmedOpt[element] = opt[element];
  });

  return trimmedOpt;
}

function getCreateActionKind(blank) {
  return blank ? "blank" : "sample";
}

function actionBanner(commandName, opt) {
  console.log(chalk.green(`'${commandName}' command called with options:`));
  console.log(opt);
}

function doNewModel(opt) {
  const actionOpt = trimOptions(opt, ["modelFile", "blank", "force"]);

  try {
    actionBanner("new model", actionOpt);

    if (fs.existsSync(actionOpt.modelFile) && !opt.force) {
      throw new Error(
        `model file ${actionOpt.modelFile} already exists, use --force to overwrite`
      );
    }

    const modelObj = actionOpt.blank ? modelBlank : modelSample;

    console.log(
      chalk.green(
        `saving ${getCreateActionKind(actionOpt.blank)} model to ${
          actionOpt.modelFile
        }`
      )
    );
    jsonStringifyAndSave(modelObj, actionOpt.modelFile);
  } catch (error) {
    console.log(chalk.red(`\nFAILED: ${error.message}\n`));
    throw error;
  }
}

function doNewProject(opt) {
  const actionOpt = trimOptions(opt, [
    "projectFile",
    "modelFile",
    "blank",
    "force"
  ]);

  try {
    actionBanner("new project", actionOpt);

    const projectFile = path.resolve(process.cwd(), actionOpt.projectFile);
    const projectDir = path.dirname(projectFile);

    if (fs.existsSync(projectFile) && !opt.force) {
      throw new Error(
        `project file ${projectFile} already exists, use --force to overwrite`
      );
    }

    const projectObj = actionOpt.blank ? projectBlank : projectSample;

    console.log(
      chalk.green(`setting model reference to ${actionOpt.modelFile}`)
    );
    projectObj.model = actionOpt.modelFile;

    console.log(
      chalk.green(
        `saving ${getCreateActionKind(
          actionOpt.blank
        )} project to ${projectFile}`
      )
    );

    const proj = latona.LatonaProject.load(projectObj, projectDir);
    proj.saveToFile(projectFile);
  } catch (error) {
    console.log(chalk.red(`\nFAILED: ${error.message}\n`));
    throw error;
  }
}

function doNewAddon(opt) {
  const actionOpt = trimOptions(opt, ["addonFile"]);

  try {
    actionBanner("new addon", actionOpt);

    const addonFileName = actionOpt.addonFile.endsWith(".js")
      ? actionOpt.addonFile
      : `${actionOpt.addonFile}.js`;

    if (fs.existsSync(addonFileName)) {
      throw new Error(`File ${addonFileName} already exists`);
    }

    console.log(chalk.green(`Writing ${addonFileName}`));
    fs.copyFileSync(addonSamplePath, addonFileName);
  } catch (error) {
    console.log(chalk.red(`\nFAILED: ${error.message}\n`));
    throw error;
  }
}

function doRender(opt) {
  const actionOpt = trimOptions(opt, ["projectFile"]);

  try {
    actionBanner("render", actionOpt);
    if (!fs.existsSync(actionOpt.projectFile)) {
      throw new Error(`project file ${actionOpt.projectFile} doesn't exist`);
    }

    const proj = latona.LatonaProject.loadFromFile(actionOpt.projectFile);
    console.log(chalk.green("Starting rendering..."));
    proj.render();
    console.log(chalk.green("Rendering successfully completed."));
  } catch (error) {
    console.log(chalk.red(`\nFAILED: ${error.message}\n`));
    throw error;
  }
}

function doValidate(opt) {
  const actionOpt = trimOptions(opt, ["projectFile"]);

  try {
    actionBanner("validate", actionOpt);
    if (!fs.existsSync(actionOpt.projectFile)) {
      throw new Error(`project file ${actionOpt.projectFile} doesn't exist`);
    }

    latona.LatonaProject.loadFromFile(actionOpt.projectFile);

    console.log(
      chalk.green(
        "Project seems to be valid (though rendering may bring surprises)."
      )
    );
  } catch (error) {
    console.log(chalk.red(`\nFAILED: ${error.message}\n`));
    throw new Error(`Validation failed: ${error}`);
  }
}

/**
 * Latona CLI main function
 * @param {string[]} argv command-line arguments
 * @param {[bool]} rethrow rethrow all exceptions (used for testing purposes and
 *   automation) (default: false)
 * @param {[function]} exitCallback Commander exit callback (default: undefined)
 * @private
 */
function main(argv, rethrow = false, exitCallback = undefined) {
  try {
    const program = new Command();
    program.name("latona");

    if (exitCallback && typeof exitCallback === "function") {
      program.exitOverride(exitCallback);
    }

    const newCommand = program
      .command("new")
      .description("create new Latona project/model/addon");

    newCommand
      .command("model")
      .description("creates new latona model")
      .option(
        "-m, --model-file <modelFile>",
        "model file name (absolute or relative to the current folder)",
        "./model.json"
      )
      .option("-b, --blank", "don't add sample content to the model", false)
      .option("-f, --force", "force file overwrite", false)
      .action(doNewModel);

    newCommand
      .command("project")
      .description("create new Latona project")
      .option(
        "-m, --model-file <modelFile>",
        "model file name (absolute or relative to project folder, must already exist)",
        "./model.json"
      )
      .option(
        "-p, --project-file <projectFile>",
        "project file name (absolute or relative to the current folder)",
        "./latona.json"
      )
      .option("-b, --blank", "don't add sample content to the project", false)
      .option("-f, --force", "force file overwrite", false)
      .action(doNewProject);

    newCommand
      .command("addon")
      .description("create new Latona addon")
      .option(
        "-a, --addon-file <addonFile>",
        "addon file name (absolute or relative to the current folder)",
        "./addon.js"
      )
      .action(doNewAddon);

    program
      .command("render")
      .description("process latona project and render code artifacts")
      .option(
        "-p, --project-file <projectFile>",
        "project file name",
        "./latona.json"
      )
      .action(doRender);

    program
      .command("validate")
      .description("load and validate latona project")
      .option(
        "-p, --project-file <projectFile>",
        "project file name",
        "./latona.json"
      )
      .action(doValidate);

    console.log(`Latona CLI (${packageJson.version})\n`);
    program.parse(argv);
    console.log(chalk.green("Done!"));
  } catch (error) {
    console.log(
      chalk.red(
        "Use 'latona [command] -h' to get help on syntax or refer to the project documentation."
      )
    );

    // this is for testing purposes only
    if (rethrow) throw error;
  }
}

if (require.main === module) {
  main(process.argv);
}

module.exports = main;
