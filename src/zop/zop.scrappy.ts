import { Browser, Page } from "puppeteer";
import Json from "../interfaces/json.interface";

export const scrappyZop = async (
  browser: Browser,
  link: string | undefined
): Promise<Json[]> => {
  // console.time("test")
  const page: Page = await browser.newPage();
  const json: Json[] = [];
  let invHrefs: string[] = [];
  await page.goto(link || "", { waitUntil: "networkidle0", timeout: 0 });

  //   await page.waitForSelector(".count", { timeout: 7000 });
  const invCount = await page?.$$eval(
    `.count`,
    (element: any) => element.map((el: any) => el?.textContent)[0]
  );

  console.log("inventory count", invCount);

  let condition =
    (await page.$(
      "#inventory_table > div > div > button.ais-InfiniteHits-loadMore"
    )) !== null
      ? true
      : false;

  while (condition) {
    await page.waitForSelector(
      "#inventory_table > div > div > button.ais-InfiniteHits-loadMore"
    );
    try {
      await page.click(
        "#inventory_table > div > div > button.ais-InfiniteHits-loadMore"
      );
    } catch (error) {
      condition = false;
    }
  }

  //#list-btn-d > a.et_pb_button.et_pb_button_0.et_pb_bg_layout_light.page_url_value
  //#list-btn-d > a.et_pb_button.et_pb_button_0.et_pb_bg_layout_light.page_url_value

  let detailLinks = await page?.$$eval(
    `#list-btn-d > a.et_pb_button.et_pb_button_0.et_pb_bg_layout_light.page_url_value`,
    (element: any) => element.map((el: any) => el?.getAttribute("href"))
  );

  detailLinks = detailLinks.map(
    (links: string) => `https://${page.url().split("/")[2]}${links}`
  );

  for (let links of detailLinks) {
    const page: Page = await browser.newPage();
    await page.goto(links, { waitUntil: "domcontentloaded" });

    let wholeInfo: Object | any;

    const images = await page?.$$eval(`#lightgallery`, (element: any) =>
      element.map((el: any) =>
        Array.from(el?.children).map((elm: any) => elm.getAttribute("data-src"))
      )
    );

    const vinStock = await page?.$$eval(`.stock-no`, (element: any) =>
      element.map((el: any) =>
        Array.from(el?.children).map((elm: any) => elm.textContent)
      )
    );

    const vin = vinStock.map((vi: string) =>
      vi[0].replace("VIN #:", "").trimStart()
    );
    const stock = vinStock.map((stk: string) =>
      stk[1].replace("STOCK #:", "").trimStart()
    );

    let price;
    try {
      price = await page?.$$eval(
        `#sidebar-detail > div > div > div.price-det > div.d-list > h3`,
        (element: any) =>
          element.map((el: any) => el.textContent)[0].replace(/\D/g, "")
      );
    } catch (error) {
      price = null;
    }

    const description = await page?.$$eval(
      `#sidebar-detail1 > div > div:nth-child(5)`,
      (element: any) => element.map((el: any) => el.innerHTML)[0]
    );

    const carfax_link = await page?.$$eval(
      `.report-detail`,
      (element: any) => element.map((el: any) => el.getAttribute("href"))[0]
    );

    const details = await page?.$$eval(
      `.fe-icon`,
      (element: any) =>
        element.map((el: any) => Array.from(el.children).length)[0]
    );

    wholeInfo = {
      imgs: images[0],
      vin: vin[0],
      stock_number: stock[0],
      carfax: carfax_link || "",
      price: price || "",
      description: description || "",
    };

    for (let i = 1; i <= +details; i++) {
      const key = await page?.$$eval(
        `#sidebar-detail1 > div > div:nth-child(3) > ul > li:nth-child(${i}) > strong:nth-child(2)`,
        (element: any) =>
          element
            .map((el: any) => el.textContent)[0]
            .replace(/\s+/g, " ")
            .replace(":", "")
            .trimStart()
            .trimEnd()
      );
      let value = await page?.$$eval(
        `#sidebar-detail1 > div > div:nth-child(3) > ul > li:nth-child(${i})`,
        (element: any) =>
          element
            .map((el: any) => el.textContent)[0]
            .replace(/\s+/g, " ")
            .replace("-", " ")
            .replace(":", "")
            .trimStart()
            .trimEnd()
      );

      value = value.replace(`${key}`, "");

      wholeInfo[key || ""] = value || "";
    }

    json.push(wholeInfo);
    await page.close();
  }

  await page.close();

  return json;
};
