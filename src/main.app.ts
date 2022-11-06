import { writeFileSync } from "fs";
import puppeteer from "puppeteer-extra";
import { resolve } from "path";
import PromptChoice from "./Prompt/Select/prompt.select";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Scrappy } from "./Prompt/Scrappy/scrappy.app";

type information = {
  username?: string;
  password?: string;
  link?: string;
};

const initialiseScrappy = async (): Promise<void> => {
  //! Command-line choices
  const prompt = new PromptChoice();

  const chosenProvider = await PromptChoice.selectOption();

  const { provider } = chosenProvider;
  const information = await prompt.checkProvider(provider);

  const { username, password, link } = information as information;
  const { fileName } = await PromptChoice.fileName();

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

  const scrappy = new Scrappy(provider, browser, link, username, password);
  const json = await scrappy.runScrappy();
  await browser.close();

  writeFileSync(
    `${resolve(`./json/${fileName}`)}.json`,
    JSON.stringify(json),
    "utf8"
  );
  console.log("DONE");
};

(async () => await initialiseScrappy())();
