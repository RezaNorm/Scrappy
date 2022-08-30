import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle } from "puppeteer";
import Json from "../interfaces/json.interface";
import scrappyUnpublished from "./Unpublished/V12.unpublished";
import { resolve } from "path";
import promptChoice from "../prompt/prompt.choices";

const initialiseScrappy = async (): Promise<void> => {
  const prompt = new promptChoice();
  const chosenProvider = await promptChoice.selectOption();
  const { provider } = chosenProvider;
  const information = await prompt.checkProvider(chosenProvider);
  // const { username?:string , password?:string , link?:string | undefined } = information
  // console.log(information);
  // return;
  console.log("Please Wait...");

  const browser = await puppeteer.launch({
    headless: false,
  });

  let json: Json[] = [];

  switch (provider) {
    case "v12panel": {
      json = await scrappyUnpublished(browser);
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
