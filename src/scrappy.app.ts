import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle } from "puppeteer";
import Json from "./interfaces/json.interface";
import scrappyUnpublished from "./V12/V12/scrappy.V12Panel";
import { resolve } from "path";
import promptChoice from "./prompt/prompt.choices";
import scrappyV12 from "./V12/V12/scrappy.V12Panel";
type information = {
  username?: string;
  password?: string;
  link?: string;
};

const initialiseScrappy = async (): Promise<void> => {
  const prompt = new promptChoice();
  const chosenProvider = await promptChoice.selectOption();
  const { provider } = chosenProvider;
  const information = await prompt.checkProvider(chosenProvider);
  const { username, password, link } = information as information;

  // return;
  console.log("Please Wait...");

  const browser = await puppeteer.launch({
    headless: false,
  });

  let json: {} = {};

  switch (provider) {
    case "v12panel": {
      json = await scrappyV12(browser);
      break;
    }

    default:
      break;
  }
  await browser.close();

  writeFileSync(
    `${resolve("./json/v12panel.js")}`,
    JSON.stringify(json),
    "utf8"
  );
  console.log("DONE");
  await browser.close();

  return;
};

(async () => await initialiseScrappy())();
