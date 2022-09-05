import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function autobunnySold(
  page: Page | undefined,
  browser: Browser
): Promise<Json[]> {
  const json: Json[] = [];

  await page?.goto("https://dealers.autobunny.ca/client/deals", {
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
  console.log(links?.length);

  for (const link of links!) {
    const page: Page = await browser.newPage();
    const wholeData: any = {};
    await page.goto(link || "", { waitUntil: "domcontentloaded" });
  }

  return json;
}
