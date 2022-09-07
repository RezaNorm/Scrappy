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

  for (const link of links!) {
    const page: Page = await browser.newPage();
    let wholeData: any;
    await page.goto(link || "", { waitUntil: "domcontentloaded" });

    const vin = await page?.$$eval(
      `#Vin`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );

    const stock_number = await page?.$$eval(
      `#StockNumber`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );
    const make = await page?.$$eval(
      `#select2-make-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const model = await page?.$$eval(
      `#select2-models-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const year = await page?.$$eval(
      `#select2-Year-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const body_style = await page?.$$eval(
      `#select2-BodyStyle-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const transmission = await page?.$$eval(
      `#select2-Transmission-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const exterior_color = await page?.$$eval(
      `#select2-ExteriorColor-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );

    const odometer = await page?.$$eval(
      `#Kilometers`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );
    const trim = await page?.$$eval(
      `#Trim`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );
    const interior_color = await page?.$$eval(
      `#select2-InteriorColor-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const door = await page?.$$eval(
      `#select2-Doors-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const drivetype = await page?.$$eval(
      `#select2-DriveType-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const fuelType = await page?.$$eval(
      `#select2-FuelType-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const engine = await page?.$$eval(
      `#select2-Engine-container`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );
    const engineSize = await page?.$$eval(
      `#EngineSize`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );
    const cityFuel = await page?.$$eval(
      `#CityFuelEconomy`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );
    const price = await page?.$$eval(
      `#Price`,
      (element: any) => element.map((el: any) => el?.getAttribute("value"))[0]
    );

    const images: (string | undefined | null)[] = await page.evaluate(() => {
      const link = [
        ...new Set(
          Array.from(
            document.querySelectorAll("#Photo > fieldset > div > ul")
          ).map((el) =>
            Array.from(el.children).map((elm) =>
              Array.from(elm.children).map((elem) =>
                Array.from(elem.children).map((element) =>
                  element.getAttribute("src")?.replace("thumb", "pic")
                )
              )
            )
          )
        ),
      ];

      return link.flat(3).filter(Boolean);
    });

    const description = await page?.$$eval(
      `#SellerComments`,
      (element: any) => element.map((el: any) => el?.textContent)[0]
    );

    wholeData = {
      vin,
      stock_number,
      make,
      model,
      year,
      body_style,
      transmission,
      exterior_color,
      odometer,
      trim,
      interior_color,
      door,
      drivetype,
      fuelType,
      engine,
      engineSize,
      cityFuel,
      price,
      description,
      imgs: images,
    };
    //#Photo > fieldset > div > ul
    console.log(wholeData);

    json.push(wholeData);
    await page.close();
  }
  await page?.close();
  return json;
}
