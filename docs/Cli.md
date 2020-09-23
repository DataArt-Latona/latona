# Latona CLI reference

Usage:

```
latona <command> [options]
```

## new model

Creates new latona model

```
latona new model [options]

Options:
  -m --model-file <modelFile>  model file name (absolute or relative to the current folder) (default: "./model.json")
  -b, --blank                  don't add sample content to the model (default: false)
  -f, --force                  force file overwrite (default: false)
  -h, --help                   display help for command
```

## new project

Create new Latona project

```
latona new project [options]

Options:
  -m, --model-file <modelFile>      model file name (absolute or relative to project folder, must already exist) (default: "./model.json")
  -p, --project-file <projectFile>  project file name (absolute or relative to the current folder) (default: "./latona.json")
  -b, --blank                       don't add sample content to the project (default: false)
  -f, --force                       force file overwrite (default: false)
  -h, --help                        display help for command
```

## new addon

Create new Latona addon

```
latona new addon [options]

Options:
  -a, --addon-file <addonFile>  addon file name (absolute or relative to the current folder) (default: "./addon.js")
  -h, --help                    display help for command
```

## render

Process latona project and render code artifacts

```
latona render [options]

Options:
  -p, --project-file <projectFile>  project file name (default: "./latona.json")
  -h, --help                        display help for command
```

## validate

Load and validate latona project

```
latona validate [options]

Options:
  -p, --project-file <projectFile>  project file name (default: "./latona.json")
  -h, --help                        display help for command
```

## help

Display help for command

```
latona help
```

or

```
latona --help
```

or

```
latona <command> help
```

or

```
latona <command> --help
```
