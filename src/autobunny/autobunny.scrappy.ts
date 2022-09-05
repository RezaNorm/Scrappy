import { Browser, Page } from "puppeteer";
import Json from "../interfaces/json.interface";
export const scrappyAutobunny = async (
  browser: Browser,
  link: string | undefined
): Promise<{}> => {
  const page: Page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  );

  const json: Json[] = [];
  let invHrefs: string[] = [];
  await page.goto(link || "", { waitUntil: "domcontentloaded" });

  await page.waitForXPath(`//*[@id="main"]/div/div[1]/div/h4`);

  const invCount = await page?.evaluate(
    (el: any) => el?.textContent.replace(/\D/g, ""),
    (
      await page?.$x(`//*[@id="main"]/div/div[1]/div/h4`)
    )[0]
  );
  console.log("all inv", invCount);
  //*[@id="main"]/div/div[2]/div/div/div/div[3]/div/div[2]/div/div[2]/span[1]/span/a[1]
  //*[@id="main"]/div/div[2]/div/div/div/div[52]/div/div[2]/div/div[2]/span[1]/span/a[1]
  const vehicleCount = await page.evaluate(() => {
    const count = Array.from(
      document.querySelectorAll(
        "#main > div > div:nth-child(2) > div > div > div"
      )
    )
      .map((el) => Array.from(el.children))
      .flat().length;

    return count;
  });
  for (let i = 3; i <= +invCount!; i++) {
    try {
      await page.waitForXPath(
        `//*[@id="main"]/div/div[2]/div/div/div/div[${i}]/div/div[2]/div/div[2]/span[1]/span/a[1]`
      );
      const link = await page.evaluate(
        (el: any) => el?.getAttribute("href"),
        (
          await page.$x(
            `//*[@id="main"]/div/div[2]/div/div/div/div[${i}]/div/div[2]/div/div[2]/span[1]/span/a[1]`
          )
        )[0]
      );

      invHrefs.push(link);
    } catch (error) {
      try {
        await page.click(
          `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div > div > a.next.page-numbers`
        );
        i = 2;
        continue;
      } catch (error) {
        break;
      }
    }
  }

  for (let href of invHrefs) {
    const page: Page = await browser.newPage();

    await page.goto(href, { waitUntil: "domcontentloaded" });

    const images: string[] = [];

    try {
      await page.waitForXPath(`//*[@id="carousel"]/div/ul`);
      const picLink = await page.evaluate(
        (el: any) =>
          Array.from(el.children).map((elm: any) =>
            elm?.getAttribute("data-thumb")
          ),
        (
          await page.$x(`//*[@id="carousel"]/div/ul`)
        )[0]
      );
      for (let pic of picLink) images.push(pic?.replace(/thumb-/g, "pic-"));
    } catch (error) {
      images.push();
    }

    let carfax: string | undefined | null;
    try {
      carfax = await page.$eval(
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-4 > div:nth-child(1) > a",
        (element) => {
          return element.getAttribute("href");
        }
      );
    } catch (error) {
      carfax = null;
    }

    const wholeInfo: any = {};
    const infoCount = await page.evaluate(() => {
      const count = Array.from(
        document.querySelectorAll(
          "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-4 > div.VehicleInfoDetails.row"
        )
      )
        .map((el) => Array.from(el.children))
        .flat().length;

      return count;
    });
    for (let i = 1; i <= +infoCount; i++) {
      try {
        const key = await page.$eval(
          `body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-4 > div.VehicleInfoDetails.row > div:nth-child(${i}) > div > span:nth-child(1)`,
          (element) => {
            return element.textContent?.replace(":", "");
          }
        );
        const value = await page.$eval(
          `body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-4 > div.VehicleInfoDetails.row > div:nth-child(${i}) > div > span:nth-child(2)`,
          (element) => {
            return element.textContent;
          }
        );

        wholeInfo[key || ""] = value || "";
      } catch (error) {
        break;
      }
    }

    let vin: string | undefined | null;
    let price: string | undefined | null;
    try {
      await page.waitForSelector(
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-heading > div > div > div.col-md-4.detailsInfo > div > span.PriceValue > span"
      );

      vin = await page.$eval(
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-heading > div > div > div.col-md-4.detailsInfo > div > span.PriceValue > span",
        (element: any) => {
          return element?.getAttribute("data-cg-vin");
        }
      );
      price = await page.$eval(
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-heading > div > div > div.col-md-4.detailsInfo > div > span.PriceValue > span",
        (element: any) => {
          return element?.getAttribute("data-cg-price");
        }
      );
    } catch (error) {
      vin = null;
      price = null;
    }
    const description: string = await page.evaluate(() => {
      const desc = Array.from(
        document.querySelectorAll(
          "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-8 > div.seller_comments.row > div"
        )
      ).map((el) => {
        return el?.innerHTML;
      });
      return desc.flat().join(" ");
    });
    wholeInfo["vin"] = vin;
    wholeInfo["price"] = price;
    wholeInfo["carfax"] = carfax;
    wholeInfo["description"] = description;
    wholeInfo["imgs"] = images;

    json.push(wholeInfo);

    await page.close();
  }
  await page.close();
  return json;
};
