//body > main > div > div > div.wrapper > div.row > div.col.primary-col > div.row > div:nth-child(1) > div > div.vehicle-card__full-details > div > div.price-block > a
//body > main > div > div > div.wrapper > div.row > div.col.primary-col > div.row > div:nth-child(2) > div > div.vehicle-card__full-details > div > div.price-block > a
//https://www.monteroauto.com/vehicles/

import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { resolve } from "path";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "../interfaces/json.interface";
import { writeFileSync } from "fs";
import axios from "axios";

const DEALERSHIP_URL = "https://www.monteroauto.com/vehicles";

const initialiseScrappy = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const json: Json[] = [];
  const hrefs = [];

  const page: Page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  for (let i = 0; i <= 8; i++) await scrollPageToBottom(page, { size: 500 });

  for (let i = 1; i <= 107; i++) {
    const links = await page?.$$eval(
      `body > main > div > div > div.wrapper > div.row > div.col.primary-col > div.row > div:nth-child(${i}) > div > div.vehicle-card__full-details > div > div.price-block > a`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
    );
    hrefs.push(links);
  }

  for (let href of hrefs!) {
    const page: Page = await browser.newPage();

    if (
      href ===
        "https://www.monteroauto.com/vehicles/2017/dodge/grand-caravan/toronto/on/56306692/?sale_class=used" ||
      href ===
        "https://www.monteroauto.com/vehicles/2016/dodge/journey/toronto/on/54185401/?sale_class=used"
    )
      continue;

    try {
      await page.goto(href, { waitUntil: "domcontentloaded", timeout: 0 });
    } catch (error) {
      continue;
    }

    console.log(href);

    const wholeData: any = {};

    await page?.waitForSelector(
      "#vdp-app > div > section > div > div.photo-gallery__buttons-container.photo-gallery__buttons-container--right > div"
    );
    await page?.click(
      "#vdp-app > div > section > div > div.photo-gallery__buttons-container.photo-gallery__buttons-container--right > div"
    );

    let images: string[] = [];

    let producttype =
      (await page.$(
        "#vdp-app > div > section > div > div.photo-gallery__container > div.vgs > div.vgs__gallery > div.vgs__gallery__container"
      )) || "";

    if (producttype) {
      images = await page?.$$eval(
        "#vdp-app > div > section > div > div.photo-gallery__container > div.vgs > div.vgs__gallery > div.vgs__gallery__container",
        (element: any) =>
          element.map((el: any) =>
            Array.from(el?.children).map((e: any) => e?.getAttribute("src"))
          )
      );
    } else {
      images = await page?.$$eval(
        "#vdp-app > div > section > div > div.photo-gallery__container > div.vgs > div > img",
        (element: any) => element.map((el: any) => el?.getAttribute("src"))
      );
    }

    wholeData["imgs"] = images
      ? images?.flat().map((el) => el?.replace("-1024x786", ""))
      : [];

    const vin = await page?.$$eval(
      "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.overview-group > div > span:nth-child(2)",
      (element: any) => element.map((el: any) => el?.textContent)
    );
    wholeData["vin"] = vin[0].replace("VIN: ", "");

    const stock = await page?.$$eval(
      "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.overview-group > div > span:nth-child(1)",
      (element: any) => element.map((el: any) => el?.textContent)
    );
    wholeData["stock"] = stock[0].replace("Stock #: ", "");

    for (let i = 1; i <= 9; i++) {
      try {
        await page?.waitForSelector(
          `#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.details-group > div > ul > li:nth-child(${i}) > div > div > h5`,
          { timeout: 500 }
        );
      } catch (error) {
        continue;
      }
      const key = await page?.$$eval(
        `#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.details-group > div > ul > li:nth-child(${i}) > div > div > h5`,
        (element: any) => element.map((el: any) => el?.textContent)
      );
      const value = await page?.$$eval(
        `#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.details-group > div > ul > li:nth-child(${i}) > div > div > p`,
        (element: any) => element.map((el: any) => el?.textContent)
      );

      const price = await page?.$$eval(
        "#vdp-app > div > div > div.row > div.col-lg-4.col-sm-5.hidden-xs-down > div > div.main-price > div > div.pricing-group__final-price.text-left > div > div > div > span",
        (element: any) =>
          element.map((el: any) => el?.textContent.replace(/\D/g, ""))
      );
      wholeData["price"] = price[0];

      await page?.click(
        "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.description-tab.mb-md > p > span"
      );
      const description = await page?.$$eval(
        "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.description-tab.mb-md > p",
        (element: any) => element.map((el: any) => el?.innerHTML)
      );
      wholeData["description"] = description[0];

      wholeData[key] = value[0];
    }

    json.push(wholeData);

    await page?.close();
  }
  let pages = await browser.pages();
  await Promise.all(pages.map((page) => page.close()));
  writeFileSync(
    `${resolve(`./json/montro`)}.json`,
    JSON.stringify(json),
    "utf8"
  );
};
(async () => await initialiseScrappy())();
