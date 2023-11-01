"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const yaml_1 = require("yaml");
const fs_1 = require("fs");
const path_1 = require("path");
const eta_1 = require("eta");
const puppeteer_1 = require("puppeteer");
function main() {
  const argsObj = yargs_1.default
    .parserConfiguration({
      "duplicate-arguments-array": false,
      "camel-case-expansion": false,
    })
    .option("t", {
      alias: "template",
      default: undefined,
      requiresArg: true,
      string: true,
      array: false,
      description: "path to eta template file",
    })
    .option("d", {
      alias: "data",
      default: undefined,
      requiresArg: true,
      string: true,
      array: false,
      description: "path to data object file",
      nargs: 1,
    })
    .option("o", {
      alias: "output",
      default: undefined,
      requiresArg: true,
      string: true,
      array: false,
      description: "output pdf file",
      nargs: 1,
    })
    .boolean("w")
    .default("w", false)
    .alias("w", "webpage")
    .describe("w", "sets output format to HTML")
    .usage(
      `A cli to generate a pdf from two file, template eta and data yml\n
      usage: $0 -t ./template.eta -d ./data.yml -o out.pdf`
    )
    .version("v", "1.0.0")
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .demandOption(["t", "d", "o"])
    .parse(process.argv);
  const argsObjTyped = argsObj;
  const dataObj = (0, yaml_1.parse)(
    (0, fs_1.readFileSync)((0, path_1.resolve)(argsObjTyped.d), {
      encoding: "utf8",
    })
  );
  const eta = new eta_1.Eta();
  eta.loadTemplate(
    "@root",
    (0, fs_1.readFileSync)((0, path_1.resolve)(argsObjTyped.t), {
      encoding: "utf8",
    })
  );
  const htmlPage = eta.render("@root", dataObj);
  if (argsObjTyped.w) {
    (0, fs_1.writeFileSync)((0, path_1.resolve)(argsObjTyped.o), htmlPage);
  } else {
    (0, puppeteer_1.launch)({ headless: "new" }).then((browser) =>
      __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        yield page.setContent(htmlPage);
        const pdf = yield page.pdf({ format: "A4" });
        yield browser.close();
        (0, fs_1.writeFileSync)((0, path_1.resolve)(argsObjTyped.o), pdf);
      })
    );
  }
}
module.exports = main;
