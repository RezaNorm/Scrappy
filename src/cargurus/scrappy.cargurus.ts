import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
// import Json from "./interfaces/json.interface";
import { writeFileSync } from "fs";

const DEALERSHIP_URL =
  "https://www.cargurus.ca/Cars/m-Khushi-Auto-Sales-sp386882#resultsPage=1";

const initialiseScrappy = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(1) > div > a
  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(2) > div > a
  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(17) > div > a
  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(16) > div > a
  //? Second page
  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(1) > div > a
  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(6) > div > a

  //! next page
  //#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.IowxOk.wygZcP.WxVEGs > button
  let hrefs = [];
  const page: Page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { waitUntil: "networkidle0" });

  for (let i = 1; i <= 17; i++) {
    let element = await page.$$eval(
      `#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(${i}) > div > a`,
      (element: any) =>
        element.map((el: { getAttribute: (arg0: string) => any }) =>
          el.getAttribute("href")
        )
    );
    hrefs.push(
      `https://www.cargurus.ca/Cars/m-Khushi-Auto-Sales-sp386882${element}`
    );
  }

  await page.click(
    "#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.IowxOk.wygZcP.WxVEGs > button"
  );

  for (let i = 1; i <= 6; i++) {
    let element = await page.$$eval(
      `#cargurus-listing-search > div > div > div > div.IWo5PZ.orzDm5 > div.pru1OV.njWUf3 > div:nth-child(${i}) > div > a`,
      (element: any) =>
        element.map((el: { getAttribute: (arg0: string) => any }) =>
          el.getAttribute("href")
        )
    );
    hrefs.push(
      `https://www.cargurus.ca/Cars/m-Khushi-Auto-Sales-sp386882${element}`
    );
  }

  hrefs = hrefs.flat().filter(Boolean);

  //#cargurus-listing-search > div > div._YH4Xx > div.iiWQld > div.Ro9a_t > section:nth-child(5) > div > dd:nth-child(22)
  // //*[@id="cargurus-listing-search"]/div/div[3]/div[2]/div[2]/section[3]/div/dd[9]
  // //*[@id="cargurus-listing-search"]/div/div[3]/div[2]/div[2]/section[3]/div/dd[11]
  // //*[@id="cargurus-listing-search"]/div/div[3]/div[2]/div[2]/section[3]/div/dd[11]
  ////*[@id="cargurus-listing-search"]/div/div[3]/div[2]/div[2]/section[3]/div/dd[7]

  for (let href of hrefs){
    const page = await browser.newPage();

    await page.goto(href, { waitUntil: "networkidle0" });
  }
  return
};
initialiseScrappy();
