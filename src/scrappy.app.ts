import { writeFileSync } from "fs";
import puppeteer from "puppeteer-extra";
import { Page, EvaluateFunc, ElementHandle } from "puppeteer";
import Json from "./interfaces/json.interface";
import scrappyUnpublished from "./V12Panel/scrappy.V12Panel";
import { resolve } from "path";
import promptChoice from "./prompt/prompt.choices";
import scrappyV12 from "./V12Panel/scrappy.V12Panel";
import { scrappyAutobunny } from "./autobunny/autobunny.website";
import scrappyAutobunnyPanel from "./autobunnyPanel/scrappy.autobunny";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { scrappyV12Website } from "./V12Website/scrappy.V12Website";
import { scrappyZop } from "./zop/zop.scrappy";
import { scrappyDealerplus } from "./dealerPlus/dealerplus.scrappy";
import { carpagesScrappy } from "./carpages/scrappy.mrmemo.carpages";
import { scrappyMvic } from './mvic/scrappy.mvic';

type information = {
  username?: string;
  password?: string;
  link?: string;
};

const initialiseScrappy = async (): Promise<void> => {
  //! command line choices
  const prompt = new promptChoice();
  const chosenProvider = await promptChoice.selectOption();
  const { provider } = chosenProvider;
  const information = await prompt.checkProvider(chosenProvider);
  const { username, password, link } = information as information;
  const { fileName } = await promptChoice.fileName();

  console.log("Please Wait...");

  puppeteer.use(AdblockerPlugin()).use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
    ],
  });

  let json: any;

  switch (provider) {
    case "v12panel": {
      try {
        json = await scrappyV12(browser, username, password);
      } catch (error) {
        console.log(error);
      }
      break;
    }
    case "mvic": {
      try {
        json = await scrappyMvic(browser, link);
      } catch (error) {
        console.log(error);
      }
      break;
    }
    case "autobunny": {
      try {
        json = await scrappyAutobunny(browser, link);
      } catch (error) {
        console.log(error);
      }
      break;
    }
    case "autobunnypanel": {
      try {
        json = await scrappyAutobunnyPanel(browser, username, password);
      } catch (error) {
        console.log(error);
      }
      break;
    }
    case "v12": {
      try {
        json = await scrappyV12Website(browser, link);
      } catch (error) {
        console.log(error);
      }
      break;
    }
    case "zop": {
      try {
        json = await scrappyZop(browser, link);
      } catch (error) {
        console.log(error);
      }
      break;
    }
    case "dealerplus":
      {
        try {
          json = await scrappyDealerplus(browser, link);
        } catch (error) {
          console.log(error);
        }
      }
      break;
    case "carpages": {
      try {
        json = await carpagesScrappy(browser, link);
      } catch (error) {
        console.log(error);
      }
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
  // let pages = await browser.pages();
  // await Promise.all(pages.map((page) => page.close()));
};

(async () => await initialiseScrappy())();
