import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { resolve } from "path";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "../../interfaces/json.interface";
import { writeFileSync } from "fs";
import axios from "axios";

const DEALERSHIP_URL = "https://www.limitlessautosales.ca/used";

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

  for (let i = 0; i <= 3; i++) await scrollPageToBottom(page, { size: 500 });

  for (let i = 1; i <= 35; i++) {
    await page.waitForXPath(
      `/html/body/div[2]/div[4]/div[2]/div[9]/div[${i}]/div/div/div/div[2]/div[1]/div[2]/div/a`
    );
    const link = await page.evaluate(
      (el: any) => el?.getAttribute("href"),
      (
        await page.$x(
          `/html/body/div[2]/div[4]/div[2]/div[9]/div[${i}]/div/div/div/div[2]/div[1]/div[2]/div/a`
        )
      )[0]
    );
    hrefs.push(`https://www.limitlessautosales.ca${link}`);
  }

  for (const href of hrefs) {
    const page: Page = await browser.newPage();

    const wholeData: any = {};

    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 0 });

    let images;

    images = await page?.$$eval(
      `#photos-tab > div > div.auto-scrolx-dimension.topContent.autoScrollx > div > ul`,
      (element: any) =>
        element.map((el: any) =>
          Array.from(el?.children).map((elm: any) =>
            Array.from(elm.children).map((elemen: any) =>
              elemen.getAttribute("src").replace("/21/", "/1/")
            )
          )
        )
    );

    if (!images.length)
      images = await page?.$$eval(
        `#imgList > li:nth-child(1) > img`,
        (element: any) =>
          element.map((el: any) => {
            el.getAttribute("src").replace("/2/", "/1/");
          })
      );

    wholeData["imgs"] = images.flat(2);

    for (let i = 1; i <= 9; i++) {
      try {
        await page?.waitForSelector(
          `#details-content > div.row.photo-slide-info-row > div.col-xs-12.col-sm-12.col-md-veh-right-used > div > table > tbody > tr:nth-child(${i}) > td.col-used-label`,
          { timeout: 500 }
        );
      } catch (error) {
        continue;
      }

      const key = await page?.$$eval(
        `#details-content > div.row.photo-slide-info-row > div.col-xs-12.col-sm-12.col-md-veh-right-used > div > table > tbody > tr:nth-child(${i}) > td.col-used-label`,
        (element: any) =>
          element.map((el: any) =>
            el.textContent.replace(/\s+/g, " ").trim().replace(":", "")
          )
      );

      const value = await page?.$$eval(
        `#details-content > div.row.photo-slide-info-row > div.col-xs-12.col-sm-12.col-md-veh-right-used > div > table > tbody > tr:nth-child(${i}) > td.col-used-value`,
        (element: any) =>
          element.map((el: any) => el.textContent.replace(/\s+/g, " ").trim())
      );
      wholeData[key] = value[0];
    }

    const description = await page?.$$eval(`#dscFull > span`, (element: any) =>
      element.map((el: any) => el.innerHTML)
    );
    wholeData["description"] = description[0];

    const stock = await page?.$$eval(
      `#photos-tab > div > div.row.image-bar-used > div > span`,
      (element: any) =>
        element.map((el: any) => el.textContent?.replace("Stock #:", ""))
    );
    wholeData["stock"] = stock[0];

    const price = await page?.$$eval(
      `#details-content > div.row.subheading-row > div.col-xs-12.col-sm-12.col-md-veh-right-used.col-mobile-3.details-used-six-dig > div > span.vehicle-price-3 > span > var:nth-child(1) > span`,
      (element: any) =>
        element.map((el: any) => el.textContent?.replace(/\D/g, ""))
    );
    wholeData["price"] = price[0];

    const vin = await page?.$$eval(
      `#details-content > div.row.photo-slide-info-row > div.col-xs-12.col-sm-12.col-md-veh-right-used > div > div:nth-child(15) > div > span`,
      (element: any) => element.map((el: any) => el.getAttribute("data-cg-vin"))
    );
    wholeData["vin"] = vin[0];

    const allOptions = [];
    for (let i = 1; i <= 2; i++) {
      for (let j = 1; j <= 9; j += 2) {
        try {
          await page?.waitForSelector(
            `#options > div > div > div:nth-child(${i}) > table:nth-child(${j}) > tbody:nth-child(3)`,
            { timeout: 500 }
          );
          const options = await page?.$$eval(
            `#options > div > div > div:nth-child(${i}) > table:nth-child(${j}) > tbody:nth-child(3)`,
            (element: any) =>
              element.map((el: any) =>
                Array.from(el?.children).map((elm: any) =>
                  Array.from(elm.children).map((elem: any) => elem.textContent)
                )
              )
          );
          allOptions.push(options);
        } catch (error) {
          continue;
        }
      }
    }
    wholeData["options"] = allOptions
      .flat(4)
      .filter(Boolean)
      .map((op) => "$1$" + op);

    json.push(wholeData);
    await page?.close();
  }

  let pages = await browser.pages();
  await Promise.all(pages.map((page) => page.close()));
  writeFileSync(
    `${resolve(`./json/limitless`)}.json`,
    JSON.stringify(json),
    "utf8"
  );
};
(async () => await initialiseScrappy())();
