import { Browser, Page } from "puppeteer";
import Json from "../interfaces/json.interface";

export const scrappyV12Website = async (
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

  const pagination = await page.evaluate(() => {
    const count = Array.from(
      document.querySelectorAll("#inventory-list > div.pagination_wrapper > ul")
    )
      .map((el) => Array.from(el.children))
      .flat().length;

    return count;
  });

  for (let j = 1; j <= pagination - 1; j++) {
    const url = await page.url();
    await page.goto(`${url.replace(`?pg=${j - 1}`, "")}?pg=${j}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(
      "#inventory-list > div.search_result_wrapper.div_list.listing-layout1 > div > div > ul",
      { timeout: 3000 }
    );
    const vehicleCount = await page.evaluate(() => {
      const count = Array.from(
        document.querySelectorAll(
          "#inventory-list > div.search_result_wrapper.div_list.listing-layout1 > div > div > ul"
        )
      )
        .map((el) => Array.from(el.children))
        .flat().length;

      return count;
    });
    for (let i = 1; i <= vehicleCount; i++) {
      await page.waitForSelector(
        `#inventory-list > div.search_result_wrapper.div_list.listing-layout1 > div > div > ul > li:nth-child(${i}) > div.inventory_vehicle_item.list.layout_default > div > div.col.col-lg-12.listing_inv_wedgets_btns > div.btns_holder_new > div.align-center.xs-hidden > a`,
        { timeout: 3000 }
      );
      const link = await page?.$$eval(
        `#inventory-list > div.search_result_wrapper.div_list.listing-layout1 > div > div > ul > li:nth-child(${i}) > div.inventory_vehicle_item.list.layout_default > div > div.col.col-lg-12.listing_inv_wedgets_btns > div.btns_holder_new > div.align-center.xs-hidden > a`,
        (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
      );
      const url = await page.url().replace("/inventory", "");
      invHrefs.push(`${url.replace(`?pg=${i}`, "")}${link}`);
    }
  }
  console.log(invHrefs);

  for (const link of invHrefs) {
    const page: Page = await browser.newPage();
    let wholeData: any;
    await page.goto(link || "", { waitUntil: "domcontentloaded" });

    const description = await page?.$$eval(
      `#note > div > div.col.col-12.note_desc_col.finance_active`,
      (element: any) => element.map((el: any) => el?.innetHTML)[0]
    );

    console.log("description", description);
    await page.close();
  }

  return {};
};
