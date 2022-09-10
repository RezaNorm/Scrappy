import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function autobunnyCustomers(
  page: Page | undefined,
  browser: Browser
): Promise<Object[]> {
  const json: Object[] = [];
  await page?.goto("https://dealers.autobunny.ca/client/customers", {
    waitUntil: "domcontentloaded",
  });

  await page?.waitForSelector("#dataTable_length > label > select");
  await page?.select("#dataTable_length > label > select", "-1");

  await page?.waitForSelector(
    "#bread-actions > ul > li > ul > li:nth-child(1) > a",
    { timeout: 3000 }
  );

  const links: (string | null)[] | undefined = await page?.evaluate(() => {
    const link = [
      ...new Set(
        Array.from(
          document.querySelectorAll(
            "#bread-actions > ul > li > ul > li:nth-child(1) > a"
          )
        )
          .map((el) => el.getAttribute("href"))
          .flat()
          .filter(Boolean)
      ),
    ];

    return link;
  });
  for (const link of links!) {
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

    console.log(wholeData);
    json.push(wholeData);
    await page?.close()
  }

  await page?.close()
  return json;
}
