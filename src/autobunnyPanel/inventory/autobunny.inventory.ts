import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function autobunnyInventory(
  page: Page | undefined,
  browser: Browser
): Promise<Json[]> {
  const json: Json[] = [];

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

    // const imageCount: number = await page.evaluate(() => {
    //   const imagesLength = [
    //     ...new Set(
    //       Array.from(
    //         document.querySelectorAll("#carousel > div > ul:nth-child(2)")
    //       )
    //         .map((el) => Array.from(el.children).length)
    //         .flat()
    //         .filter(Boolean)
    //     ),
    //   ];

    //   return imagesLength[0];
    // });

    //! Get Other Info
    for (let i = 1; i <= 13; i++) {
      try {
        for (let j = 1; j <= 2; j++) {
          await page?.waitForSelector(
            `#info > div:nth-child(${i}) > div:nth-child(${j}) > div > label`,
            { timeout: 3000 }
          );
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
                .replace(/\s+/g, "")
          );
          console.log(key);
          console.log(value);
          wholeData[key] = value;
        }
      } catch (error) {
        break;
      }
    }

    //! Get Comment
    const description = await page?.$$eval(
      `#comments > div > div`,
      (element: any) => element.map((el: any) => el?.innerHTML)
    );

    wholeData["description"] = description[0];

    json.push(wholeData);
    await page.close();
  }

  return json;
}
