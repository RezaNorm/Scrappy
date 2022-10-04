import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../../interfaces/json.interface";

export default async function V12Customers(
  page: Page | undefined,
  browser: Browser
): Promise<Object[]> {
  // //! Vehicle links
  const json: Object[] = [];

  //! click on published
  await page?.waitForSelector("#Menu > a"); //
  await page?.click("#Menu > a");

  await page?.goto("https://www.v12software.com/crmv3/contacts", {
    waitUntil: "domcontentloaded",
  });

  await page?.waitForSelector("#mCSB_1_container > li:nth-child(2) > a");
  //! contact count
  //#mCSB_1_container
  const contactCount = await page?.$$eval(`#mCSB_1_container`, (element: any) =>
    element.map((el: any) => Array.from(el?.children).length)
  );

  for (let i = 2; i <= contactCount[0]; i++) {
    let wholeData: any = {};
    await page?.click(`#mCSB_1_container > li:nth-child(${i}) > a`);
    await page?.waitForNetworkIdle();

    let full_name = await page?.$$eval(
      "#contact_big_name > p",
      (element: any) => element.map((el: any) => el?.textContent)
    );
    full_name = full_name[0] ? full_name[0].replace(/\s+/g, " ").trim() : "";
    wholeData["fullName"] = full_name;

    let phone = await page?.$$eval(
      "#contact_phone_list > div:nth-child(2) > div > span > a:nth-child(1)",
      (element: any) => element.map((el: any) => el?.textContent)
    );
    phone = phone[0] ? phone[0].replace(/\s+/g, " ").trim() : "";
    wholeData["phone"] = phone;

    let email = await page?.$$eval(
      "#contact_email_list > div:nth-child(2) > div > div > span > div > a",
      (element: any) => element.map((el: any) => el?.textContent)
    );
    email = email[0];
    wholeData["email"] = email ? email : "";

    let address = await page?.$$eval(
      "#contact_address > span > div > a:nth-child(1)",
      (element: any) => element.map((el: any) => el?.textContent)
    );
    address = address[0];
    wholeData["address"] = address ? address : "";

    console.log(wholeData);
    json.push(wholeData);
  }

  await page?.close();
  return json;
}

//   console.log(contactCount);
//! sel for contacts
//#mCSB_1_container > li:nth-child(2) > a
//#mCSB_1_container > li:nth-child(3) > a

//! contact name
//#contact_big_name > p

//! contact phone
//#contact_phone_list > div:nth-child(2) > div > span > a:nth-child(1)

//! contact email
//#contact_email_list > div:nth-child(2) > div > div > span > div > a

//! contact address
//#contact_address > span > div > a:nth-child(1)
