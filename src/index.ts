import * as fs from "fs";
import * as path from "path";
import commander from "commander";
import chalk from "chalk";
import { interpolate } from "./interpolate";

class Handler {
  fieldsPath: string[];
  targetPath: string;
  outputPath: string;
  extraEnvs: Record<string, string> = {};

  constructor(private program: commander.Command) {
    this.setup();
    this.validate();
    this.run();
  }

  logError(message: string) {
    console.log(chalk.red(message));
    process.exit();
  }

  log(message: string) {
    console.log(chalk.blue(message));
  }

  setup() {
    if (!this.program.target) {
      this.logError(
        "You need to provide a target to replace the fields on using --target <file_to_target>"
      );
    }

    this.fieldsPath = this.program.fields?.map(v =>
      path.join(process.cwd(), v)
    );

    this.targetPath = path.join(process.cwd(), this.program.target);
    this.outputPath = path.join(
      process.cwd(),
      this.program.output ||
        path.parse(this.program.target).name +
          ".out" +
          path.parse(this.program.target).ext
    );

    for (const index in this.program.env as string[]) {
      if (+index % 2 === 1) continue;
      else {
        if (!this.program.env[+index + 1]) {
          this.logError(
            "You need to provide an even amount of extra env in the following form -e key value -e value2 key2 "
          );
        } else {
          this.extraEnvs[this.program.env[index]] = this.program.env[
            +index + 1
          ];
        }
      }
    }
  }

  validate() {
    if (this.fieldsPath)
      for (const target of this.fieldsPath) {
        if (!fs.existsSync(target)) {
          this.logError("Not able to find target file at " + target);
        }
      }
  }

  run() {
    const fieldsObjects = this.fieldsPath?.map(v => {
      return JSON.parse(fs.readFileSync(v, "utf-8"));
    });

    const targetObject = JSON.parse(fs.readFileSync(this.targetPath, "utf-8"));

    let mergeObject = {};

    fieldsObjects?.forEach(v => {
      mergeObject = {
        ...{ ...mergeObject },
        ...v
      };
    });

    const parsedEnvgateObj = interpolate({
      ...mergeObject,
      ...this.extraEnvs,
      ...targetObject
    });

    const newTaskDef = {};

    for (const key in targetObject) {
      newTaskDef[key] = parsedEnvgateObj[key];
    }

    if (this.program.get) {
      const wantedValues = newTaskDef[this.program.get];
      if (!wantedValues) {
        this.logError("You are trying to get a value which does not exist");
      } else {
        console.log(wantedValues);
        process.exit();
      }
    }

    fs.writeFileSync(this.outputPath, JSON.stringify(newTaskDef, undefined, 2));

    this.log("Created new file: " + this.outputPath);
  }
  envgatePath(envgatePath: any, arg1: string): string {
    throw new Error("Method not implemented.");
  }
}

new Handler(
  new commander.Command()
    .option("-f, --fields <string...>", "Path for the fields file")
    .option("-t, --target [string]", "Path for the target file")
    .option("-o, --output [string]", "Path for the outputted file")
    .option("-e, --env <string...>", "extra enviroment varibles")
    .option("-g, --get [string]", "gets a certain value from the env")
    .version("0.0.4")
    .parse(process.argv)
);
