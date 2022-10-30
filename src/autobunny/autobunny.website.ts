import { Browser, Page } from "puppeteer";
import Json from "../interfaces/json.interface";
import * as cliProgress from "cli-progress";
import colors from "ansi-colors";

export const scrappyAutobunny = async (
  browser: Browser,
  link: string | undefined
): Promise<{}> => {
  const page: Page = await browser.newPage();

  const json: Json[] = [];
  let invHrefs: string[] = [];
  await page.goto(link || "", { waitUntil: "domcontentloaded" });
  let count;

  //! Selecting show 100 vehicles if exists
  try {
    await page?.waitForSelector(
      "#main > div > div:nth-child(2) > div > div > div > div.row.sortingPaging > div.col-sm-4.sortingPagingView > a:nth-child(5)"
    );
    await page?.click(
      "#main > div > div:nth-child(2) > div > div > div > div.row.sortingPaging > div.col-sm-4.sortingPagingView > a:nth-child(5)"
    );
    count = 103;
  } catch (error) {
    count = 23;
  }

  await page.waitForXPath(`//*[@id="main"]/div/div[1]/div/h4`);

  const invCount = await page?.evaluate(
    (el: any) => el?.textContent.replace(/\D/g, ""),
    (
      await page?.$x(`//*[@id="main"]/div/div[1]/div/h4`)
    )[0]
  );
  console.log("invntory count", invCount);

  //! Finding View Details Links
  for (let i = 3; i <= +count!; i++) {
    try {
      await page.waitForSelector(
        `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-9.col-xs-8.col-md-9 > div:nth-child(1) > div > a`,
        { timeout: 3000 }
      );

      const link = await page?.$$eval(
        `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-9.col-xs-8.col-md-9 > div:nth-child(1) > div > a`,
        (element: any) => element.map((el: any) => el?.getAttribute("href"))
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

  invHrefs = invHrefs.flat();

  let progressBar = new cliProgress.SingleBar({
    format: "getting cars |" + colors.cyan("{bar}") + "| {percentage}%",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  progressBar.start(invHrefs.length, 0);

  //! Opening view detail links one by one and scrape the details
  for (let [index,href] of invHrefs.entries()) {
    const page: Page = await browser.newPage();

    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 0 });

    const images: string[] = [];

    try {
      await page.waitForXPath(`//*[@id="carousel"]/div/ul`, { timeout: 3000 });
      const picLink = await page.evaluate(
        (el: any) =>
          Array.from(el.children).map((elm: any) =>
            elm?.getAttribute("data-thumb")
          ),
        (
          await page.$x(`//*[@id="carousel"]/div/ul`)
        )[0]
      );
      for (let pic of picLink) images.push(pic?.replace(/thumb/g, "pic"));
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
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-heading > div > div > div.col-md-4.detailsInfo > div > span.PriceValue > span",
        { timeout: 3000 }
      );

      vin = await page.$$eval(
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-heading > div > div > div.col-md-4.detailsInfo > div > span.PriceValue > span",
        (element: any) =>
          element.map((el: any) => el?.getAttribute("data-cg-vin"))[1]
      );
      
      price = await page.$eval(
        "body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-heading > div > div > div.col-md-4.detailsInfo > div > span.PriceValue > span",
        (element: any) => {
          return element?.getAttribute("data-cg-price");
        }
      );

      if (!price) {
        price = await page.$eval(".PriceValue", (element: any) => {
          return element?.textContent?.replace(/\D/g, "");
        });
      }
    } catch (error) {
      try {
        if (!price) {
          await page.waitForSelector(".PriceValue", { timeout: 3000 });
          price = await page.$eval(".PriceValue", (element: any) => {
            return element?.textContent?.replace(/\D/g, "");
          });
        }
      } catch (error) {
        price = null;
      }
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

    for (let i = 5; i <= 9; i++) {
      try {
        await page.waitForSelector(
          `body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-8 > div:nth-child(${i}) > div > ul`,
          { timeout: 500 }
        );
        let options = await page?.$$eval(
          `body > div.container.main-content-area.main-content-area-page.detailsPage > div > div.row > div > div.panel.panel-default.vehicle-details > div.panel-body > div > div > div.col-md-8 > div:nth-child(${i}) > div > ul`,
          (element: any) => element.map((el: any) => el?.innerHTML)
        );
        let option = options[0];
        option = option
          .replace(/<li>/g, "$1$")
          .replace(/<\/li>/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .split("$1$")
          .filter(Boolean)
          .map((option: string) => "$1$" + option);

        wholeInfo["options"] = option;
      } catch (error) {
        continue;
      }
    }

    wholeInfo["vin"] = vin;
    wholeInfo["price"] = price;
    wholeInfo["carfax"] = carfax;
    wholeInfo["description"] = description;
    wholeInfo["imgs"] = images;

    json.push(wholeInfo);

    await page.close();
    progressBar.increment();
    progressBar.update(index + 1);
  }
  progressBar?.stop();

  await page.close();
  return json;
};
