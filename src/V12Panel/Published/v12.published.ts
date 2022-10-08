import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function V12Published(
  page: Page | undefined,
  browser: Browser
): Promise<Json[]> {
  // //! Vehicle links
  const json: Json[] = [];

  let hrefsPublished = [];

  //! click on published
  await page?.waitForSelector(
    "#header > div:nth-child(9) > div.Header-Titleless > ul > li:nth-child(2) > a"
  ); //
  await page?.click(
    "#header > div:nth-child(9) > div.Header-Titleless > ul > li:nth-child(2) > a"
  );

  //! show 100 record
  let count = 100;
  await page?.waitForSelector("#perpage");
  await page?.select("#perpage", `${count}`);

  //! find publish count
  await page?.waitForXPath(`//*[@id="header"]/div[5]/div[1]/ul/li[2]/a`);
  const publish = await page?.evaluate(
    (el: any) => el?.textContent.replace(/\D/g, ""),
    (
      await page?.$x(`//*[@id="header"]/div[5]/div[1]/ul/li[2]/a`)
    )[0]
  );
  console.log("publish count", publish);

  //! extract vehicle links one by one
  for (let i = 1; i <= +count!; i++) {
    try {
      await page?.waitForSelector(
        `#published > table.Block-List > tbody > tr:nth-child(${i}) > td.Cell-InvList-New-Vehicle.First-Column > a:nth-child(1)`
      );

      let link = await page?.$$eval(
        `#published > table.Block-List > tbody > tr:nth-child(${i}) > td.Cell-InvList-New-Vehicle.First-Column > a:nth-child(1)`,
        (element: any) => element.map((el: any) => el.getAttribute("href"))
      );
      hrefsPublished.push(`https://www.v12software.com/inventory/${link}`);
    } catch (error) {
      break;
    }

    let producttype =
      (await page?.$(
        "#header > div:nth-child(11) > div.Win-Footer > div > a"
      )) || "";

    if (producttype && i === count) {
      await page?.waitForSelector(
        "#header > div:nth-child(11) > div.Win-Footer > div > a"
      );

      await page?.click(
        "#header > div:nth-child(11) > div.Win-Footer > div > a"
      );
    }
  }
  hrefsPublished = hrefsPublished.flat();
  
  //! open links and scrape details one by one 
  for (let [index, href] of hrefsPublished.entries()) {
    const page: Page = await browser.newPage();

    await page.goto(href, { waitUntil: "domcontentloaded" });
    console.log(`${index} vehicle done`);

    //!#vin
    const vin_el: ElementHandle<Element> | null = await page.$("#vin");
    const vin_number: string | null | undefined = await page.evaluate(
      (el) => el?.getAttribute("value"),
      vin_el
    );
    //!#trim_ct
    const trim_el: ElementHandle<Element> | null = await page.$("#trim_ct");
    const trim: string | null | undefined = await page.evaluate(
      (el) => el?.getAttribute("value"),
      trim_el
    );
    //!##body_type
    const bodyStyle_el: ElementHandle<Element> | null = await page.$(
      "#body_type"
    );
    const bodyStyle: string | null | undefined = await page.evaluate(
      (el) => el?.getAttribute("value"),
      bodyStyle_el
    );

    //!Doors
    const door: string | null | undefined = await page.evaluate(() => {
      const Doorlist = [
        ...new Set(
          Array.from(document.querySelectorAll("#doors"))
            .map((el) =>
              Array.from(el.children).map((elm) => {
                if (elm.getAttribute("selected") === "selected")
                  return elm.getAttribute("value");
              })
            )
            .flat()
            .filter(Boolean)
        ),
      ];

      return Doorlist[0];
    });

    //!Engine
    const engine_el: ElementHandle<Element> | null = await page.$("#engine_ct");
    const engine: string | null | undefined = await page.evaluate(
      (el) => el?.getAttribute("value"),
      engine_el
    );

    //!Cylinders
    const cylinder = await page.evaluate<[], () => string | null | undefined>(
      () => {
        const cylinder = [
          ...new Set(
            Array.from(document.querySelectorAll("#cylinders"))
              .map((el) =>
                Array.from(el.children).map((elm) => {
                  if (elm.getAttribute("selected") === "selected")
                    return elm.getAttribute("value");
                })
              )
              .flat()
              .filter(Boolean)
          ),
        ];

        return cylinder[0];
      }
    );

    //!Transmission
    const transmission = await page.evaluate<
      [],
      () => string | null | undefined
    >(() => {
      const transmission = [
        ...new Set(
          Array.from(document.querySelectorAll("#transmission_ct"))
            .map((el) =>
              Array.from(el.children).map((elm) => {
                if (elm.getAttribute("selected") === "selected")
                  return elm.textContent;
              })
            )
            .flat()
            .filter(Boolean)
        ),
      ];

      return transmission[0];
    });

    //!Fuel
    const fuel: string | null | undefined = await page.evaluate<
      [],
      () => string | null | undefined
    >(() => {
      const fuel = [
        ...new Set(
          Array.from(document.querySelectorAll("#fuel_ct"))
            .map((el) =>
              Array.from(el.children).map((elm) => {
                if (elm.getAttribute("selected") === "selected")
                  return elm.textContent;
              })
            )
            .flat()
            .filter(Boolean)
        ),
      ];

      return fuel[0];
    });

    //!Drivetrain
    const drivetrain: string | null | undefined = await page.evaluate<
      [],
      () => string | null | undefined
    >(() => {
      const drivetrain = [
        ...new Set(
          Array.from(document.querySelectorAll("#drivetype"))
            .map((el) =>
              Array.from(el.children).map((elm) => {
                if (elm.getAttribute("selected") === "selected")
                  return elm.textContent;
              })
            )
            .flat()
            .filter(Boolean)
        ),
      ];

      return drivetrain[0];
    });

    //!Odometer
    const odometer: string | null | undefined = await page.evaluate(() => {
      const odometer = Array.from(
        document.querySelectorAll(".InvList-UL-Mileage")
      ).map((el) => {
        const elm = Array.from(el.children)[0];
        const unit = Array.from(elm.children)[0].textContent?.includes(
          "Kilometers"
        )
          ? `km`
          : `miles`;

        return `${elm.textContent?.replace(/\D/g, "")} ${unit}`;
      });
      return odometer[0];
    });

    //!Stock
    const stock_number: string | null | undefined = await page.evaluate(() => {
      const stock_number = Array.from(
        document.querySelectorAll(".InvList-UL-Mileage")
      ).map((el) => {
        return Array.from(el.children)[1]
          .textContent?.replace("Inventory ID:", "")
          .trim();
      });
      return stock_number[0];
    });

    //! Ext & Int Color
    const [interior_color, exterior_color]: (string | null | undefined)[] =
      await page.evaluate(() => {
        const colors = Array.from(
          document.querySelectorAll(".InvList-UL-Colors")
        ).map((el) => {
          let colors = [];
          colors.push(
            Array.from(el.children)[0]
              .textContent?.replace("Ext Color:", "")
              .trim()
          );
          colors.push(
            Array.from(el.children)[1]
              .textContent?.replace("Int Color:", "")
              .trim()
          );
          return colors;
        });

        return colors.flat();
      });

    //!Price
    const price: string | null | undefined = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".InvList-Price")).map((el) =>
        el.textContent?.replace(/\D/g, "")
      )[0];
    });

    //!Description
    const description = await page.$eval("#description", (element) => {
      return element.textContent;
    });

    //! Open Photos

    await page.click(
      "#vehicleForm > div > div.Header-Titleless > ul > li:nth-child(3) > a"
    );
    //! Get Image Links
    await page.waitForSelector(
      "#header > div.colmask.twocol > div > div > div.col1 > div:nth-child(2) > div.Header-Titleless > ul > li:nth-child(3) > a"
    );
    const photoCount: string | undefined = await page.$eval(
      "#header > div.colmask.twocol > div > div > div.col1 > div:nth-child(2) > div.Header-Titleless > ul > li:nth-child(3) > a",
      (element) => {
        return element.textContent?.replace(/\D/g, "");
      }
    );

    const images: string[] = [];
    if (+photoCount!)
      for (let i = 0; i <= +photoCount! - 1; i++) {
        await page.waitForXPath(`//*[@id="${i}"]/img`);
        const link = await page.evaluate(
          (el: any) => el?.getAttribute("src"),
          (
            await page.$x(`//*[@id="${i}"]/img`)
          )[0]
        );
        images.push(
          link?.replace(/w_160/g, "w_800").replace(/h_120/g, "h_600")
        );
      }

    const jsonData: Json = {
      description,
      vin: vin_number,
      price,
      odometer,
      stock_number,
      interior_color,
      exterior_color,
      transmission,
      bodyStyle,
      trim,
      engine,
      cylinder,
      fuel,
      drivetrain,
      imgs: images,
    };

    json.push({ ...jsonData });

    await page.close();
  }
  return json;
}
