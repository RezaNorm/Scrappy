import { Browser, Page } from "puppeteer";
export const scrappyAutobunny = async (
  browser: Browser,
  link: string | undefined
): Promise<{}> => {
  const page: Page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  );
  let invHrefs = [];
  await page.goto(link || "", { waitUntil: "networkidle0" });
  await page.waitForXPath(`//*[@id="main"]/div/div[1]/div/h4`);
  const invCount = await page?.evaluate(
    (el: any) => el?.textContent.replace(/\D/g, ""),
    (
      await page?.$x(`//*[@id="main"]/div/div[1]/div/h4`)
    )[0]
  );

  for (let i = 3; i <= +invCount!; i++) {
    await page?.waitForSelector(
      `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block`
    );

    let link = await page?.$$eval(
      `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block`,
      (element: any) => element.map((el: any) => el.getAttribute("href"))
    );
    invHrefs.push(`${link}`);
  }

  console.log("autobunny hrefs",invHrefs);
  return {}
  //#main > div > div:nth-child(2) > div > div > div > div:nth-child(3) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
  //#main > div > div:nth-child(2) > div > div > div > div:nth-child(12) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
  //? second page
  //#main > div > div:nth-child(2) > div > div > div > div:nth-child(3) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
  //#main > div > div:nth-child(2) > div > div > div > div:nth-child(12) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
// for (let href of invHrefs){
//     const page: Page = await browser.newPage();

//     await page.goto(href, { waitUntil: "domcontentloaded" });


// }


};

// (async () => await scrappyAutobunny(Browser))();
