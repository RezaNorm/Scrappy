import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle } from "puppeteer";

const DEALERSHIP_URL = "https://www.v12software.com/accounts_v2/signup2/login";

const initialisePuppeteer = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page: Page = await browser.newPage();
  await page.goto(DEALERSHIP_URL, { waitUntil: "networkidle0" });
  //#unpulished > table.Block-List > tbody > tr:nth-child(1) > td.Cell-InvList-Vehicle.First-Column > a:nth-child(1)
  //#total_unpublished //? Unpublish count selector
  //#unpulished > table.Block-List > tbody > tr:nth-child(64) > td.Cell-InvList-Vehicle.First-Column > a:nth-child(1)
  //
  //! type username pass
  await page.type("input[type='email']", "driveoncanada@gmail.com");
  await page.type("input[type='password']", "Onlyme2310!");

  await page.click(
    "#app > div:nth-child(1) > div.undefined > section > div:nth-child(1) > div > form > button"
  );

  //! click on inventory when it shows
  await page.waitForSelector("#Menu > ul > li:nth-child(7) > a");
  await page.click("#Menu > ul > li:nth-child(7) > a");

  //! click on un-published inv when shown
  await page.waitForSelector(
    "#header > div:nth-child(11) > div.Header-Titleless > ul > li:nth-child(1) > a"
  );
  await page.click(
    "#header > div:nth-child(11) > div.Header-Titleless > ul > li:nth-child(1) > a"
  );

  //! unpublish count
  const unpublish_el = await page.$("#total_unpublished");
  let unpublish = await page.evaluate(
    (el) => el?.textContent?.replace(/\D/g, ""),
    unpublish_el
  );

  //! Vehicle links
  let hrefs = [];
  for (let i = 1; i <= +unpublish!; i++) {
    let element = await page.$$eval(
      `#unpulished > table.Block-List > tbody > tr:nth-child(${i}) > td.Cell-InvList-Vehicle.First-Column > a:nth-child(1)`,
      (element: any) =>
        element.map((el: { getAttribute: (arg0: string) => any }) =>
          el.getAttribute("href")
        )
    );
    hrefs.push(`https://www.v12software.com/inventory/${element}`);
  }
  hrefs = hrefs.flat();

  for (let href of hrefs) {
    const page = await browser.newPage();

    await page.goto(href, { waitUntil: "networkidle0" });

    //#vin
    const vin_el = await page.$("#vin");
    const vin_number = await page.evaluate(
      (el) => el?.getAttribute("value"),
      vin_el
    );

    console.log(vin_number);
    await page.close()
  }
  //#year_ct
  //#other_make_ct
  return;
};

(async () => await initialisePuppeteer())();
