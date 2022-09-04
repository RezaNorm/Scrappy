import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle } from "puppeteer";
import Json from "./interfaces/json.interface";
import scrappyUnpublished from "./V12/scrappy.V12Panel";
import { resolve } from "path";
import promptChoice from "./prompt/prompt.choices";
import scrappyV12 from "./V12/scrappy.V12Panel";
import { scrappyAutobunny } from "./autobunny/autobunny.scrappy";
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
  const { fileName } = await promptChoice.fileName();

  console.log("Please Wait...");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
    ],
  });

  let json: {} = {};

  switch (provider) {
    case "v12panel": {
      json = await scrappyV12(browser, username, password);
      break;
    }
    case "autobunny": {
      json = await scrappyAutobunny(browser, link);
      break;
    }
    default:
      break;
  }
  await browser.close();

  writeFileSync(
    `${resolve(`./src/json/${fileName}`)}.json`,
    JSON.stringify(json),
    "utf8"
  );
  console.log("DONE");
  await browser.close();
  // let pages = await browser.pages();
  // await Promise.all(pages.map((page) => page.close()));

  return;
};

(async () => await initialiseScrappy())();