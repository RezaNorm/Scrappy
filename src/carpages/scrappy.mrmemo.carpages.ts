import * as puppeteer from "puppeteer";
import { Page, Browser } from "puppeteer";
import { resolve } from "path";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "../interfaces/json.interface";
import { writeFileSync } from "fs";

export const carpagesScrappy = async (
  browser: Browser,
  link: string | undefined
): Promise<Json[]> => {
  const json: Json[] = [];
  const hrefs = [];

  const page: Page = await browser.newPage();

  await page.goto(link || "", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  await page?.waitForSelector(
    `body > div.main-container > div > div > div.col-12.col-lg-8 > div.box > header > div > span > strong`,
    { timeout: 0 }
  );
  let count = await page?.$$eval(
    `body > div.main-container > div > div > div.col-12.col-lg-8 > div.box > header > div > span > strong`,
    (element: any) => element.map((el: any) => el?.textContent)
  );
  let iteration;

  try {
    await page?.waitForSelector(
      "body > div.main-container > div > div > div.col-12.col-lg-8 > div.box > div.rule--top.box.no-shadow > ul > li:nth-child(6) > a",
      { timeout: 2000 }
    );
    await page?.click(
      "body > div.main-container > div > div > div.col-12.col-lg-8 > div.box > div.rule--top.box.no-shadow > ul > li:nth-child(6) > a"
    );
    iteration = count[0].split("of")[1].trim();
  } catch (error) {
    iteration = 21;
  }
  for (let i = 1; i <= +iteration; i++) {
    try {
      await page?.waitForSelector(
        `body > div.main-container > div > div > div.col-12.col-lg-8 > div.box > div:nth-child(${i}) > div > div > div.l-column.l-column--large-8 > hgroup > h4 > a`,
        { timeout: 500 }
      );
    } catch (error) {
      continue;
    }
    const links = await page?.$$eval(
      `body > div.main-container > div > div > div.col-12.col-lg-8 > div.box > div:nth-child(${i}) > div > div > div.l-column.l-column--large-8 > hgroup > h4 > a`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
    );
    hrefs.push(`https://www.carpages.ca/${links}`);
  }

  for (let href of hrefs!) {
    const page: Page = await browser.newPage();

    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 0 });

    console.log(href);

    const wholeData: any = {};

    let images: string[] = [];

    images = await page?.$$eval(
      "#js-carousel > div.carousel__control.soft--ends > ol",
      (element: any) =>
        element.map((el: any) =>
          Array.from(el?.children).map((ele: any) =>
            Array.from(ele?.children).map((elem: any) =>
              elem?.getAttribute("href")
            )
          )
        )
    );

    wholeData["imgs"] = images.flat(4);

    for (let j = 1; j <= 3; j++) {
      try {
        await page?.waitForSelector(
          `#vhcl-info > div.vhcl-info > div.vhcl-info__moreDetails.push--top > ul > li:nth-child(${j}) > strong`,
          { timeout: 500 }
        );
        const key = await page?.$$eval(
          `#vhcl-info > div.vhcl-info > div.vhcl-info__moreDetails.push--top > ul > li:nth-child(${j}) > strong`,
          (element: any) =>
            element.map((el: any) => el?.textContent.replace(":", ""))
        );
        const value = await page?.$$eval(
          `#vhcl-info > div.vhcl-info > div.vhcl-info__moreDetails.push--top > ul > li:nth-child(${j})`,
          (element: any) => element.map((el: any) => el?.textContent)
        );
        wholeData[key] = value[0].replace("VIN: ","").replace("Stock #: ","").trim();
      } catch (error) {
        continue;
      }
    }

    const description = await page?.$$eval(
      "#cpVehicleComments",
      (element: any) => element.map((el: any) => el?.innerHTML)
    );
    wholeData["description"] = description[0];

    const detailLength = await page?.$$eval(
      `#vehicle-details > ul`,
      (element: any) =>
        element.map((el: any) => Array.from(el?.children).length)[0]
    );

    console.log("detail length", detailLength);

    const price = await page?.$$eval("#vdpPrice > h3", (element: any) =>
      element.map((el: any) => el?.textContent.replace(/\D/g, ""))
    );
    wholeData["price"] = price[0];

    for (let i = 1; i <= +detailLength; i++) {
      try {
        await page?.waitForSelector(
          `#vehicle-details > ul > li:nth-child(${i}) > span:nth-child(1)`,
          { timeout: 500 }
        );
      } catch (error) {
        continue;
      }
      const key = await page?.$$eval(
        `#vehicle-details > ul > li:nth-child(${i}) > span:nth-child(1)`,
        (element: any) => element.map((el: any) => el?.textContent)
      );
      const value = await page?.$$eval(
        `#vehicle-details > ul > li:nth-child(${i}) > span:nth-child(2)`,
        (element: any) => element.map((el: any) => el?.textContent)
      );

      wholeData[key] = value[0].trim();
    }

    json.push(wholeData);

    await page?.close();
  }
  let pages = await browser.pages();
  await Promise.all(pages.map((page) => page.close()));
  return json;
};
