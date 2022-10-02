import { Browser, Page } from "puppeteer";
import Json from "../interfaces/json.interface";

export const scrappyV12Website = async (
  browser: Browser,
  link: string | undefined
): Promise<{}> => {
  const page: Page = await browser.newPage();
  // await page.setUserAgent(
  //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  // );

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
      timeout:0
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
      invHrefs.push(`${url.replace(`?pg=${j}`, "")}${link}`);
    }
  }

  for (const link of invHrefs) {
    const page: Page = await browser.newPage();
    let wholeData: any = {};
    await page.goto(link || "", { waitUntil: "domcontentloaded" });

    const description = await page?.$$eval(
      `#note > div > div.col.col-12.note_desc_col.finance_active`,
      (element: any) => element.map((el: any) => el?.innerHTML)[0]
    );

    await page.waitForSelector(
      "#specs > div > div > div.col.col-12.col-sm-12.col-md-12.col-lg-12.specs_part > table > tbody"
    );

    const specs = await page?.$$eval(
      `#specs > div > div > div.col.col-12.col-sm-12.col-md-12.col-lg-12.specs_part > table > tbody`,
      (element: any) => element.map((el: any) => el?.children?.length)
    );

    const price = await page?.$$eval(
      `#inventory_details > div > div:nth-child(2) > div.inventory_detail_item > div.header_title > div > div.col.col-12.col-sm-12.col-md-12.col-lg-4.rmv-padding.xs-hidden > div > h2`,
      (element: any) => element.map((el: any) => el?.textContent.replace(/\D/g,""))
    );

    for (let i = 1; i <= specs; i++) {
      let key = await page?.$$eval(
        `#specs > div > div > div.col.col-12.col-sm-12.col-md-12.col-lg-12.specs_part > table > tbody > tr:nth-child(${i}) > td.info-label`,
        (element: any) => element.map((el: any) => el?.textContent)
      );

      let value = await page?.$$eval(
        `#specs > div > div > div.col.col-12.col-sm-12.col-md-12.col-lg-12.specs_part > table > tbody > tr:nth-child(${i}) > td.info-value`,
        (element: any) => element.map((el: any) => el?.textContent)
      );

      key = key[0].replace(":", "").replace(/\s+/g, " ").trim();
      value = value[0].replace(":", "").replace(/\s+/g, " ").trim();
      wholeData[key] = value;
    }

    await page.waitForSelector(
      "#inventory_details > div > div:nth-child(2) > div.inventory_detail_item > div.row > div.col.col-12.col-sm-12.col-md-12.col-lg-8.xs-rmv-padding > div.carousel_vehicle_detail_nav_wrapper.xs-hidden > div > div > div",
      { timeout: 3000 }
    );
    //! Get Images
    const images: (string | null | undefined)[] = await page.evaluate(() => {
      const imagesUrl = [
        ...new Set(
          Array.from(
            document.querySelectorAll(
              "#inventory_details > div > div:nth-child(2) > div.inventory_detail_item > div.row > div.col.col-12.col-sm-12.col-md-12.col-lg-8.xs-rmv-padding > div.carousel_vehicle_detail_nav_wrapper.xs-hidden > div > div > div"
            )
          )
            .map((el) =>
              Array.from(el.children).map((elm) => {
                if (parseInt(elm.getAttribute("data-slick-index") || "") >= 0) {
                  return Array.from(elm.children).map((elem) =>
                    elem.getAttribute("src")
                  );
                }
              })
            )
            .flat(2)
            .filter(Boolean)
        ),
      ];

      return imagesUrl;
    });

    wholeData["imgs"] = images;
    wholeData["description"] = description;
    wholeData["price"] = price
    json.push(wholeData)
    console.log(wholeData);

    await page.close();
  }

  await page?.close()
  return json;
};
