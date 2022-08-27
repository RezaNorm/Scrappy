// const express = require("express");
import * as puppeteer from "puppeteer";
//autobunny dealership
// const DEALERSHIP_URL = "https://www.khushiauto.ca/used-cars";
const DEALERSHIP_URL = "https://www.kmsfinecars.com/used-cars/";

const initialisePuppeteer = async (): Promise<void> => {
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
//body > div.elementor.elementor-294.elementor-location-archive > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-62624b5 > div > div.elementor-element.elementor-element-eab4933.elementor-widget.elementor-widget-jet-listing-grid > div > div > div > div.jet-listing-grid__item.jet-listing-dynamic-post-820 > div > div > section > div > div > div > section.elementor-section.elementor-inner-section.elementor-element.elementor-element-39767e9.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element.elementor-element-e2b69dd > div > div > div > div
//body > div.elementor.elementor-294.elementor-location-archive > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-62624b5 > div > div.elementor-element.elementor-element-eab4933.elementor-widget.elementor-widget-jet-listing-grid > div > div > div > div.jet-listing-grid__item.jet-listing-dynamic-post-819 > div > div > section > div > div > div > section.elementor-section.elementor-inner-section.elementor-element.elementor-element-39767e9.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element.elementor-element-e2b69dd > div > div > div > div  
//body > div.elementor.elementor-294.elementor-location-archive > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-62624b5 > div > div.elementor-element.elementor-element-eab4933.elementor-widget.elementor-widget-jet-listing-grid > div > div > div > div.jet-listing-grid__item.jet-listing-dynamic-post-1515 > div > div > section > div > div > div > section.elementor-section.elementor-inner-section.elementor-element.elementor-element-39767e9.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element.elementor-element-e2b69dd > div > div > div > div
//body > div.elementor.elementor-294.elementor-location-archive > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-62624b5 > div > div.elementor-element.elementor-element-eab4933.elementor-widget.elementor-widget-jet-listing-grid > div > div > div > div.jet-listing-grid__item.jet-listing-dynamic-post-1490 > div > div > section > div > div > div > section.elementor-section.elementor-inner-section.elementor-element.elementor-element-39767e9.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element.elementor-element-e2b69dd > div > div > div > div > a
//body > div.elementor.elementor-294.elementor-location-archive > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-62624b5 > div > div.elementor-element.elementor-element-eab4933.elementor-widget.elementor-widget-jet-listing-grid > div > div > div > div

const hrefs = [];
  for (let i = 3; i <= 12; i++) {
    let element = await page.$$eval<string[]>(
      `body > div.elementor.elementor-294.elementor-location-archive > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-62624b5 > div > div.elementor-element.elementor-element-eab4933.elementor-widget.elementor-widget-jet-listing-grid > div > div > div > div`,
      (element: any) =>
        element.map((el: { getAttribute: (arg0: string) => any }) =>
          el.getAttribute("href")
        )
    );
    hrefs.push(element);
  }
  // for (let i = 3; i <= 12; i++) {
  //   let element = await page.$$eval<string[]>(
  //     `#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block`,
  //     (element: any) =>
  //       element.map((el: { getAttribute: (arg0: string) => any }) =>
  //         el.getAttribute("href")
  //       )
  //   );
  //   hrefs.push(element);
  // }
  console.log(hrefs);
  // let value = await page.evaluate(el => el.textContent, element)
  // console.log(value);
};

initialisePuppeteer();
