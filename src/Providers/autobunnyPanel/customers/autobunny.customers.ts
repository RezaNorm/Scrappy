import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import * as cliProgress from "cli-progress";
import colors from "ansi-colors";

/**
 * 
 * @param page
 * @param browser
 * @returns [{Json}]
 */

export default async function autobunnyCustomers(
  page: Page | undefined,
  browser: Browser,
  username: string | undefined,
  password: string | undefined
): Promise<Object[]> {
  const json: Object[] = [];

  await page?.goto(`https://dealers.autobunny.ca/client/customers`, {
    waitUntil: "networkidle2",
  });

  const hrefs = [];

  let count = 100;

  await page?.waitForSelector("#dataTable_length > label > select");
  await page?.select("#dataTable_length > label > select", `${count}`);
  // await page?.waitForNetworkIdle()

  for (let i = 1; i <= count; i++) {
    // await page?.waitForSelector(`#dataTable_next`)
    const nextbutton = await page?.$$eval(
      `#dataTable_next`,
      (element: any) => element.map((el: any) => el?.getAttribute("class"))[0]
    );

    let link;
    try {
      await page?.waitForSelector(
        `#dataTable > tbody > tr:nth-child(${i}) > td.no-sort.no-click.bread-actions > ul > li > ul > li:nth-child(1) > a`,
        { timeout: 500 }
      );
      link = await page?.$$eval(
        `#dataTable > tbody > tr:nth-child(${i}) > td.no-sort.no-click.bread-actions > ul > li > ul > li:nth-child(1) > a`,
        (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
      );
      if (link) hrefs.push(link);
    } catch (error) {
      continue;
    }

    if (!nextbutton?.includes("disabled") && i === count) {
      const button = await page?.$("#dataTable_next > a");
      await button?.evaluate((b: any) => b.click());
      i = 0;
      await page?.waitForNetworkIdle();
      continue;
    }
    if (nextbutton?.includes("disabled") && !link) break;
  }

  console.log("cusotmers length", hrefs.length);

  let progressBar = new cliProgress.SingleBar({
    format: "getting customers|" + colors.cyan("{bar}") + "| {percentage}%",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    fps: 60,
  });

  progressBar.start(hrefs.length, 0);

  for (const [index, link] of hrefs.entries()) {
    const page: Page = await browser.newPage();
    const wholeData: any = {};

    // try {
    await page.goto(link || "", { waitUntil: "domcontentloaded" });
    // } catch (error) {
    //   continue;
    // }

    //! if login page shows up out of nowhere ( autobunny bug )
    if (page.url() === "https://dealers.autobunny.ca/client/login") {
      //! type username pass
      await page.type("#email", username || "");
      await page.type("#passwordGroup > div > input", password || "");

      //! login
      await page.waitForSelector(
        "body > div > div > div.col-xs-12.col-sm-5.col-md-4.login-sidebar > div > form > button"
      );
      await page.click(
        "body > div > div > div.col-xs-12.col-sm-5.col-md-4.login-sidebar > div > form > button"
      );
    }

    //! Get Personal Info
    try {
      for (let i = 1; i <= 13; i++) {
        try {
          for (let j = 1; j <= 2; j++) {
            try {
              await page?.waitForSelector(
                `#personalformation > div:nth-child(${i}) > div:nth-child(${j}) > div > div > label`,
                { timeout: 100 }
              ); //
            } catch (error) {
              continue;
            }
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
    } catch (error) {
      continue;
    }

    // console.log(wholeData);
    await page?.close();
    progressBar.increment();
    progressBar.update(index + 1);
  }
  progressBar?.stop();

  await page?.close();
  return json;
}
