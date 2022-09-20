import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function autobunnySold(
  page: Page | undefined,
  browser: Browser
): Promise<{ active: Json[]; deactive: Json[] }> {
  const json: { active: Json[]; deactive: Json[] } = {
    active: [],
    deactive: [],
  };

  let hrefs: { active: string[]; deactive: string[] } = {
    active: [],
    deactive: [],
  };

  await page?.goto("https://dealers.autobunny.ca/client/deals", {
    waitUntil: "domcontentloaded",
  });

  const count = 100;

  await page?.waitForSelector("#dataTable_length > label > select");
  await page?.select("#dataTable_length > label > select", `${count}`);

  for (let i = 1; i <= count; i++) {
    await page?.waitForSelector(
      `#dataTable > tbody > tr:nth-child(${i}) > td.yc-column-2.yc-column-img.yc-tooltip > span > a`
    );
    const links = await page?.$$eval(
      `#dataTable > tbody > tr:nth-child(${i}) > td.yc-column-2.yc-column-img.yc-tooltip > span > a`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
    );
    const id = links.replace(/\D/g, "");

    const activeStatus = await page?.$$eval(
      `#active-${id} > i`,
      (element: any) => element.map((el: any) => el?.getAttribute("class"))[0]
    );

    if (activeStatus.includes("green")) hrefs.active.push(links);
    if (activeStatus.includes("danger")) hrefs.deactive.push(links);

    const nextbutton = await page?.$$eval(
      `#dataTable_next`,
      (element: any) => element.map((el: any) => el?.getAttribute("class"))[0]
    );
    if (!nextbutton.includes("disabled"))
      await page?.click("#dataTable_next > a");
    else break;
  }

  console.log("sold active length",hrefs.active.length)
  for (const link of hrefs.active) {
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
  }

  console.log("sold deactive length",hrefs.deactive.length)
  for (const link of hrefs.deactive) {
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
  }

  // await page?.waitForSelector(
  //   "#bread-actions > ul > li > ul > li:nth-child(1) > a",
  //   { timeout: 3000 }
  // );

  // const links: (string | null)[] | undefined = await page?.evaluate(() => {
  //   const link = [
  //     ...new Set(
  //       Array.from(
  //         document.querySelectorAll(
  //           "#bread-actions > ul > li > ul > li:nth-child(1) > a"
  //         )
  //       )
  //         .map((el) => el.getAttribute("href"))
  //         .flat()
  //         .filter(Boolean)
  //     ),
  //   ];

  //   return link;
  // });
  // for (const link of hrefs!) {
  //   const page: Page = await browser.newPage();
  //   let wholeData: any;
  //   await page.goto(link || "", { waitUntil: "domcontentloaded" });

  //   const vin = await page?.$$eval(
  //     `#Vin`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );

  //   const stock_number = await page?.$$eval(
  //     `#StockNumber`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );
  //   const make = await page?.$$eval(
  //     `#select2-make-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const model = await page?.$$eval(
  //     `#select2-models-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const year = await page?.$$eval(
  //     `#select2-Year-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const body_style = await page?.$$eval(
  //     `#select2-BodyStyle-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const transmission = await page?.$$eval(
  //     `#select2-Transmission-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const exterior_color = await page?.$$eval(
  //     `#select2-ExteriorColor-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );

  //   const odometer = await page?.$$eval(
  //     `#Kilometers`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );
  //   const trim = await page?.$$eval(
  //     `#Trim`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );
  //   const interior_color = await page?.$$eval(
  //     `#select2-InteriorColor-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const door = await page?.$$eval(
  //     `#select2-Doors-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const drivetype = await page?.$$eval(
  //     `#select2-DriveType-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const fuelType = await page?.$$eval(
  //     `#select2-FuelType-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const engine = await page?.$$eval(
  //     `#select2-Engine-container`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );
  //   const engineSize = await page?.$$eval(
  //     `#EngineSize`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );
  //   const cityFuel = await page?.$$eval(
  //     `#CityFuelEconomy`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );
  //   const price = await page?.$$eval(
  //     `#Price`,
  //     (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
  //   );

  //   const images: (string | undefined | null)[] = await page.evaluate(() => {
  //     const link = [
  //       ...new Set(
  //         Array.from(
  //           document.querySelectorAll("#Photo > fieldset > div > ul")
  //         ).map((el) =>
  //           Array.from(el.children).map((elm) =>
  //             Array.from(elm.children).map((elem) =>
  //               Array.from(elem.children).map((element) =>
  //                 element.getAttribute("src")?.replace("thumb", "pic")
  //               )
  //             )
  //           )
  //         )
  //       ),
  //     ];

  //     return link.flat(3).filter(Boolean);
  //   });

  //   const description = await page?.$$eval(
  //     `#SellerComments`,
  //     (element: any) => element.map((el: any) => el?.textContent)[0]
  //   );

  //   wholeData = {
  //     vin,
  //     stock_number,
  //     make,
  //     model,
  //     year,
  //     body_style,
  //     transmission,
  //     exterior_color,
  //     odometer,
  //     trim,
  //     interior_color,
  //     door,
  //     drivetype,
  //     fuelType,
  //     engine,
  //     engineSize,
  //     cityFuel,
  //     price,
  //     description,
  //     imgs: images,
  //   };
  //   //#Photo > fieldset > div > ul
  //   console.log(wholeData);

  //   json.active.push(wholeData);
  //   await page.close();
  // }
  await page?.close();
  return json;
}
