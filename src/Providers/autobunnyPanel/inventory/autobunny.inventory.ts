import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../../interfaces/json.interface";
import * as cliProgress from "cli-progress";
import colors from "ansi-colors";

export default async function autobunnyInventory(
  page: Page | undefined,
  browser: Browser,
  username: string | undefined,
  password: string | undefined
): Promise<{ active: Json[]; deactive: Json[] }> {
  const json: { active: Json[]; deactive: Json[] } = {
    active: [],
    deactive: [],
  };

  let hrefs: { active: string[]; deactive: string[] } = {
    active: [],
    deactive: [],
  };

  await page?.goto("https://dealers.autobunny.ca/client/inventory", {
    waitUntil: "domcontentloaded",
  });

  await page?.waitForSelector("#dataTable_length > label > select", {
    timeout: 3000,
  });

  await page?.select("#dataTable_length > label > select", "-1");

  const countShown = await page?.$$eval(
    `#dataTable > tbody`,
    (element: any) =>
      element.map((el: any) => Array.from(el?.children).length)[0]
  );

  await page?.waitForSelector(
    "#bread-actions > ul > li > ul > li:nth-child(1) > a",
    { timeout: 3000 }
  );

  for (let i = 1; i <= countShown; i++) {
    try {
      await page?.waitForSelector(
        `#dataTable > tbody > tr:nth-child(${i}) > td.yc-column-2.yc-column-img.yc-tooltip > span > a`
      );
    } catch (error) {
      try {
        continue;
      } catch (error) {
        break;
      }
    }

    const links = await page?.$$eval(
      `#dataTable > tbody > tr:nth-child(${i}) > td.yc-column-2.yc-column-img.yc-tooltip > span > a`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
    );
    const id = links?.replace(/\D/g, "");

    const activeStatus = await page?.$$eval(
      `#active-${id} > i`,
      (element: any) => element.map((el: any) => el?.getAttribute("class"))[0]
    );
    
    if (activeStatus?.includes("green")) hrefs.active.push(links);
    if (activeStatus?.includes("danger")) hrefs.deactive.push(links);

    const nextbutton = await page?.$$eval(
      `#dataTable_next`,
      (element: any) => element.map((el: any) => el?.getAttribute("class"))[0]
    );
    if (!nextbutton.includes("disabled") && i === countShown) {
      const button = await page?.$("#dataTable_next > a");
      await button?.evaluate((b: any) => b.click());
      i = 0;
      continue;
    } 
  }

  let progressBar = new cliProgress.SingleBar({
    format:
      "getting active |" +
      colors.cyan("{bar}") +
      "| {percentage}%",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  progressBar.start(hrefs.active.length, 0);

  for (const [index,link] of hrefs.active.entries()) {
    const page: Page = await browser.newPage();
    const wholeData: any = {};
    await page.goto(link || "", { waitUntil: "domcontentloaded" });

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

    try {
      await page.waitForSelector("#carousel > div > ul:nth-child(2)", {
        timeout: 3000,
      });

      //! Get Images
      const images: (string | null | undefined)[] = await page.evaluate(() => {
        const imagesUrl = [
          ...new Set(
            Array.from(
              document.querySelectorAll("#carousel > div > ul:nth-child(2)")
            )
              .map((el) =>
                Array.from(el.children).map((elm) =>
                  elm.getAttribute("data-thumb")?.replace("thumb", "pic")
                )
              )
              .flat()
              .filter(Boolean)
          ),
        ];

        return imagesUrl;
      });
      wholeData["imgs"] = images;
    } catch (error) {
      wholeData["imgs"] = [];
    }

    //! Get Other Info
    for (let i = 1; i <= 13; i++) {
      try {
        for (let j = 1; j <= 2; j++) {
          await page?.waitForSelector(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div > label`,
            { timeout: 3000 }
          ); //#personalformation > div:nth-child(2) > div:nth-child(1) > div > div > label
          const key = await page?.$$eval(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div > label`,
            (element: any) =>
              element.map((el: any) =>
                el?.textContent?.replace(":", "").trim()
              )[0]
          );
          const value = await page?.$$eval(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div`,
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

    let options;
    try {
      await page.waitForSelector(`#options > div > div > div`, {
        timeout: 500,
      });
      options = await page?.$$eval(
        `#options > div > div > div`,
        (element: any) => element.map((el: any) => el?.innerHTML)
      );
    } catch (error) {
      options = null;
    }

    options = options[0]
      .replace(/\s+/g, "")
      .trim()
      .split("-")
      .filter(Boolean)
      .map((op: string) => `$1$` + op);

    wholeData["options"] = options;

    //! Get Comment
    const description = await page?.$$eval(
      `#comments > div > div`,
      (element: any) => element.map((el: any) => el?.innerHTML)
    );

    wholeData["description"] = description[0];

    json.active.push(wholeData);
    await page.close();
    progressBar.increment();
    progressBar.update(index + 1);
  }
  progressBar?.stop();

  progressBar = new cliProgress.SingleBar({
    format:
      "getting deactive cars |" +
      colors.cyan("{bar}") +
      "| {percentage}%",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  progressBar.start(hrefs.deactive.length, 0);

  for (const [index,link] of hrefs.deactive.entries()) {
    const page: Page = await browser.newPage();
    const wholeData: any = {};
    await page.goto(link || "", { waitUntil: "domcontentloaded" });

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

    try {
      await page.waitForSelector("#carousel > div > ul:nth-child(2)", {
        timeout: 3000,
      });

      //! Get Images
      const images: (string | null | undefined)[] = await page.evaluate(() => {
        const imagesUrl = [
          ...new Set(
            Array.from(
              document.querySelectorAll("#carousel > div > ul:nth-child(2)")
            )
              .map((el) =>
                Array.from(el.children).map((elm) =>
                  elm.getAttribute("data-thumb")?.replace("thumb", "pic")
                )
              )
              .flat()
              .filter(Boolean)
          ),
        ];

        return imagesUrl;
      });
      wholeData["imgs"] = images;
    } catch (error) {
      wholeData["imgs"] = [];
    }

    //! Get Other Info
    for (let i = 1; i <= 13; i++) {
      try {
        for (let j = 1; j <= 2; j++) {
          await page?.waitForSelector(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div > label`,
            { timeout: 3000 }
          ); //#personalformation > div:nth-child(2) > div:nth-child(1) > div > div > label
          const key = await page?.$$eval(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div > label`,
            (element: any) =>
              element.map((el: any) =>
                el?.textContent?.replace(":", "").trim()
              )[0]
          );
          const value = await page?.$$eval(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div`,
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

    let options;
    try {
      await page.waitForSelector(`#options > div > div > div`, {
        timeout: 500,
      });
      options = await page?.$$eval(
        `#options > div > div > div`,
        (element: any) => element.map((el: any) => el?.innerHTML)
      );
    } catch (error) {
      options = null;
    }

    options = options[0]
      .replace(/\s+/g, "")
      .trim()
      .split("-")
      .filter(Boolean)
      .map((op: string) => `$1$` + op);

    wholeData["options"] = options;

    //! Get Comment
    const description = await page?.$$eval(
      `#comments > div > div`,
      (element: any) => element.map((el: any) => el?.innerHTML)
    );

    wholeData["description"] = description[0];

    json.deactive.push(wholeData);
    await page.close();
    progressBar.increment();
    progressBar.update(index + 1);
  }
  progressBar?.stop();

  return json;
}
