import * as fs from "fs";
import path from "path";

import arg from "arg";
import chalkTemplate from "chalk-template";

import "source-map-support/register";

interface ArgsDefinition {
  [key: string]: {
    type: StringConstructor | BooleanConstructor | NumberConstructor;
    alias: string;
  };
}

interface Options {
  [key: string]: StringConstructor | BooleanConstructor | NumberConstructor;
}
interface Aliases {
  [key: string]: string;
}

const argDef: ArgsDefinition = {
  "--help": {
    type: Boolean,
    alias: "-h",
  },
  "--version": {
    type: Boolean,
    alias: "-v",
  },
  "--flag": {
    type: String,
    alias: "-f",
  },
};

const options: Options = Object.keys(argDef)
  .map((key) => {
    const target: Options = {};
    target[key] = argDef[key].type;
    return target;
  })
  .reduce((cur, acc) => Object.assign(acc, cur));

const aliases: Aliases = Object.keys(argDef)
  .map((key) => {
    const target: Aliases = {};
    target[argDef[key].alias] = key;
    return target;
  })
  .reduce((cur, acc) => Object.assign(acc, cur));

const argConfig = {
  // Types
  ...options,

  // Aliases
  ...aliases,
};

export function run() {
  const args = arg(argConfig, {
    permissive: true,
  });
  const packageJson = JSON.parse(
    Buffer.from(
      fs.readFileSync(path.resolve("package.json"), { flag: "r" })
    ).toString()
  );

  const helpMessage = chalkTemplate`
  {bold USAGE}

      {dim $} {bold ${Object.keys(packageJson.bin).pop()}} [--help] --string {underline some-arg} {underline file-path}

  {bold OPTIONS}
      --help                 Shows this help message
      --version              Print version of this module
      --flag {underline flag}          Flag
  {bold file-path}           File path
`;

  if (args["--help"]) {
    console.error(helpMessage);
    process.exit(0);
  }

  if (args["--version"]) {
    console.info(packageJson.version);
    process.exit(0);
  }

  // console.log(JSON.stringify(args));

  if (args["_"] && args["_"].length > 0) {
    console.log(args["_"][0])
  }
}
