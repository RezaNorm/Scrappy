//body > main > div > div > div.wrapper > div.row > div.col.primary-col > div.row > div:nth-child(1) > div > div.vehicle-card__full-details > div > div.price-block > a
//body > main > div > div > div.wrapper > div.row > div.col.primary-col > div.row > div:nth-child(2) > div > div.vehicle-card__full-details > div > div.price-block > a

import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "./interfaces/json.interface";
import { writeFileSync } from "fs";
import axios from "axios";

const DEALERSHIP_URL = "https://www.monteroauto.com/vehicles";

const initialiseScrappy = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: false,
  }); 

  const page: Page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { waitUntil: "domcontentloaded" , timeout: 0});

  await scrollPageToBottom(page, { size: 500, delay:500 })

}
(async () => await initialiseScrappy())();