import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function autobunnyCustomers(
  page: Page | undefined,
  browser: Browser
): Promise<Object[]> {
  const json: Object[] = [];
  await page?.goto(`https://dealers.autobunny.ca/client/customers`, {
    waitUntil: "domcontentloaded",
  });

  const hrefs = [];

  let count = 100;

  await page?.waitForSelector("#dataTable_length > label > select");
  await page?.select("#dataTable_length > label > select", `${count}`);

  for (let i = 1; i <= count; i++) {
    await page?.waitForSelector(
      `#dataTable > tbody > tr:nth-child(${i}) > td.no-sort.no-click.bread-actions > ul > li > ul > li:nth-child(1) > a`
    );
    const link = await page?.$$eval(
      `#dataTable > tbody > tr:nth-child(${i}) > td.no-sort.no-click.bread-actions > ul > li > ul > li:nth-child(1) > a`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
    );
    hrefs.push(link);
    const nextbutton = await page?.$$eval(
      `#dataTable_next`,
      (element: any) => element.map((el: any) => el?.getAttribute("class"))[0]
    );
    if (!nextbutton.includes("disabled")) {
      const button = await page?.$("#dataTable_next > a");
      await button?.evaluate((b: any) => b.click());
      i = 0;
      continue;
    } else break;
  }

  console.log("cusotmers length", hrefs.length);

  for (const link of hrefs!) {
    const page: Page = await browser.newPage();
    const wholeData: any = {};
    await page.goto(link || "", { waitUntil: "domcontentloaded" });

    //! Get Personal Info
    for (let i = 1; i <= 13; i++) {
      try {
        for (let j = 1; j <= 2; j++) {
          await page?.waitForSelector(
            `#personalformation > div:nth-child(${i}) > div:nth-child(${j}) > div > div > label`,
            { timeout: 3000 }
          ); //
          const key = await page?.$$eval(
            `#personalformation > div:nth-child(${i}) > div:nth-child(${j}) > div > div > label`,
            (element: any) =>
              element.map((el: any) =>
                el?.textContent?.replace(":", "").trim()
              )[0]
          );
          const value = await page?.$$eval(
            `#personalformation > div:nth-child(${i}) > div:nth-child(${j}) > div > div`,
            (element: any) =>
              element
                .map((el: any) => el?.textContent)
                .map((val: any) => val.trim())[0]
                .split(":")
                .pop()
                .replace(/\s+/g, " ")
                .trim()
          );
          wholeData[key] = value;
        }
      } catch (error) {
        break;
      }
    }

    // console.log(wholeData);
    json.push(wholeData);
    await page?.close();
  }

  await page?.close();
  return json;
}
