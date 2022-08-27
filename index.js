// const express = require("express");
const puppeteer = require("puppeteer");

//autobunny dealership
// const DEALERSHIP_URL = "https://www.khushiauto.ca/used-cars";
const DEALERSHIP_URL = "https://www.kmsfinecars.com/used-cars/";


const initialisePuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { timeout: 0 });
  // #main > div > div:nth-child(2) > div > div > div > div:nth-child(3)
  //#main > div > div:nth-child(2) > div > div > div > div:nth-child(12)
  //btn btn-inventory-details btn-default btn-block
  //#main > div > div:nth-child(2) > div > div > div > div:nth-child(4) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
  // await page.waitForSelector('a[href="https://www.khushiauto.ca/used-cars"]');

  const hrefs = [];
  
  for (let i = 3; i <= 12; i++) {
    let element = await page.$$eval(
      `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block`,
      (element) => element.map((el) => el.getAttribute("href"))
    );
    hrefs.push(element);
  }
  console.log(hrefs);
  // let value = await page.evaluate(el => el.textContent, element)
  // console.log(value);
};

initialisePuppeteer();
