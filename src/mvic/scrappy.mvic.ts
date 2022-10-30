import { Browser, Page } from "puppeteer";
import Json from "../interfaces/json.interface";
import * as cliProgress from "cli-progress";
import colors from "ansi-colors";

export const scrappyMvic = async (
  browser: Browser,
  link: string | undefined
): Promise<{}> => {
  const page: Page = await browser.newPage();

  const json: Json[] = [];
  let invHrefs: string[] = [];
  await page.goto(link || "", { waitUntil: "domcontentloaded" });

  //body > main > div > div:nth-child(2) > div.pl-sm.pr-sm > div > div.col.primary-col > div.row.grid-row > div:nth-child(13) > div > div.vehicle-card__details > a.button.gtm_vehicle_tile_cta.vehicle-card__cta

  for (let i = 1; i <= 13; i++) {
    await page.waitForSelector(
      `body > main > div > div:nth-child(2) > div.pl-sm.pr-sm > div > div.col.primary-col > div.row.grid-row > div:nth-child(${i}) > div > div.vehicle-card__details > a.button.gtm_vehicle_tile_cta.vehicle-card__cta`,
      { timeout: 3000 }
    );

    const link = await page?.$$eval(
      `body > main > div > div:nth-child(2) > div.pl-sm.pr-sm > div > div.col.primary-col > div.row.grid-row > div:nth-child(${i}) > div > div.vehicle-card__details > a.button.gtm_vehicle_tile_cta.vehicle-card__cta`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))
    );

    invHrefs.push(link);
  }

  invHrefs = invHrefs.flat(2);

  for (let [index, href] of invHrefs.entries()) {
    const page: Page = await browser.newPage();

    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 0 });
    const wholeInfo: any = {};

    for (let j = 1; j <= 11; j++) {
      try {
        const key = await page?.$eval(
          `#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.details-group > div > ul > li:nth-child(${j}) > div > div > h5`,
          (element) => {
            return element.textContent?.replace("# of ", "");
          }
        );

        const value = await page?.$eval(
          `#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.details-group > div > ul > li:nth-child(${j}) > div > div > p`,
          (element) => {
            return element.textContent;
          }
        );

        wholeInfo[key || ""] = value || "";
      } catch (error) {
        break;
      }
    }

    await page?.waitForSelector(
      "#vdp-app > div > section > div > div.photo-gallery__buttons-container.photo-gallery__buttons-container--right > div"
    );
    await page.click(
      `#vdp-app > div > section > div > div.photo-gallery__buttons-container.photo-gallery__buttons-container--right > div`
    );

    const images = await page.$eval(
      "#vdp-app > div > section > div > div.photo-gallery__container > div.vgs > div.vgs__gallery > div.vgs__gallery__container",
      (element) => {
        return Array.from(element.children).map((el) => el.getAttribute("src"));
      }
    );
    wholeInfo["imgs"] = images;

    const stock = await page.$eval(
      "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.overview-group > div > span:nth-child(1)",
      (element) => element.textContent?.replace("Stock #: ", "")
    );
    wholeInfo["stock"] = stock;

    const vin = await page.$eval(
      "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.overview-group > div > span:nth-child(2)",
      (element) => element.textContent?.replace("VIN: ", "")
    );
    wholeInfo["vin"] = vin;

    const price = await page.$eval(
      "#vdp-app > div > div > div.row > div.col-lg-4.col-sm-5.hidden-xs-down > div > div.main-price > div > div.pricing-group__final-price.text-left > div > div > div > span",
      (element) => element.textContent?.replace(/\D/g, "")
    );
    wholeInfo["price"] = price;

    const description = await page.$eval(
      "#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.description-tab.mb-md > p",
      (element) => element.innerHTML
    );
    wholeInfo["description"] = description;

    const full_options = [];

    for (let k = 2; k <= 6; k++) {
      try {
        const options = await page.$eval(
          `#vdp-app > div > div > div.row > div.col-lg-8.col-sm-7.col-xs-12 > div.techspecs-tab.mb-md > div:nth-child(${k}) > div > ul`,
          (element) =>
            element.innerHTML
              ?.replace(/<li>/g, "$1$")
              .split("</li>")
              .filter(Boolean)
        );
        full_options.push(options);
      } catch (error) {
        continue;
      }
    }
    wholeInfo["description"] = description;
    wholeInfo["options"] = full_options.flat(3);

    console.log(wholeInfo);
    json.push(wholeInfo)
    await page.close();
  }
  await page.close();
  return json;
};
