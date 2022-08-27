// // const express = require("express");
// const puppeteer = require("puppeteer");

// //autobunny dealership
// // const DEALERSHIP_URL = "https://www.khushiauto.ca/used-cars";
// const DEALERSHIP_URL = "https://www.kmsfinecars.com/used-cars/";

// const initialisePuppeteer = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//   });

//   const page = await browser.newPage();

//   await page.goto(DEALERSHIP_URL, { timeout: 0 });
//   // #main > div > div:nth-child(2) > div > div > div > div:nth-child(3)
//   //#main > div > div:nth-child(2) > div > div > div > div:nth-child(12)
//   //btn btn-inventory-details btn-default btn-block
//   //#main > div > div:nth-child(2) > div > div > div > div:nth-child(4) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
//   // await page.waitForSelector('a[href="https://www.khushiauto.ca/used-cars"]');

//   const hrefs = [];

//   for (let i = 3; i <= 12; i++) {
//     let element = await page.$$eval(
//       `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block`,
//       (element) => element.map((el) => el.getAttribute("href"))
//     );
//     hrefs.push(element);
//   }
//   console.log(hrefs);
//   // let value = await page.evaluate(el => el.textContent, element)
//   // console.log(value);
// };

// initialisePuppeteer();

// const express = require("express");
const puppeteer = require("puppeteer");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");
//autobunny dealership
// const DEALERSHIP_URL = "https://www.khushiauto.ca/used-cars";
// const DEALERSHIP_URL = "https://www.kmsfinecars.com/used-cars/";
const DEALERSHIP_URL = "https://premiumdrive.ca/vehicles/";

const infiniteScroll = async (page, i) => {
  await scrollPageToBottom(page, { size: 500, delay: 250 });
};
const initialisePuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { timeout: 0 });

  //div.jet-listing-grid__item:nth-child(24) > div:nth-child(1)
  //div.jet-listing-grid__item:nth-child(22) > div:nth-child(1)
  ///div.jet-listing-grid__item:nth-child(3) > div:nth-child(1)
  //div.jet-listing-grid__item:nth-child(78) > div:nth-child(1)

  const hrefs = [];
  infiniteScroll(page, i);
  for (let i = 3; i <= 78; i++) {
    let element = await page.$$eval(
      `div.jet-listing-grid__item:nth-child(${i}) > div:nth-child(1)`,
      (element) => element.map((el) => el.getAttribute("data-url"))
    );
    hrefs.push(element);
  }

  console.log(hrefs);
};

initialisePuppeteer();
