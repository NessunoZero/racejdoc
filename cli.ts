import yargs from "yargs";
import { parse as ymlParse } from "yaml";
import { readFileSync, writeFileSync } from "fs";
import { resolve as resolvePath } from "path";
import { Eta } from "eta";
import { launch as launchBrowser } from "puppeteer";

function main() {
  const argsObj = yargs
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
    .describe("w", "ask for an html output")
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

  const argsObjTyped = argsObj as {
    t: string;
    d: string;
    o: string;
    w: boolean;
  };

  const dataObj = ymlParse(
    readFileSync(resolvePath(argsObjTyped.d), { encoding: "utf8" })
  );

  const eta = new Eta();
  eta.loadTemplate(
    "@root",
    readFileSync(resolvePath(argsObjTyped.t), { encoding: "utf8" })
  );
  const htmlPage = eta.render("@root", dataObj);
  if (argsObjTyped.w) {
    writeFileSync(resolvePath(argsObjTyped.o), htmlPage);
  } else {
    launchBrowser({ headless: "new" }).then(async (browser) => {
      const page = await browser.newPage();
      await page.setContent(htmlPage);
      const pdf = await page.pdf({ format: "A4" });
      await browser.close();
      writeFileSync(resolvePath(argsObjTyped.o), pdf);
    });
  }
}

module.exports = main;
