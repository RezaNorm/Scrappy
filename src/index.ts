// const express = require("express");
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "./json.interface";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { ElementHandle } from "puppeteer";

const DEALERSHIP_URL = "https://premiumdrive.ca/vehicles/";

const initialisePuppeteer = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const json: Json[] = [];

  const page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { waitUntil: "networkidle0" });

  for (let i = 0; i <= 6; i++) {
    await scrollPageToBottom(page, { size: 500, delay: 250 });
  }

  let hrefs = [];
  for (let i = 1; i <= 78; i++) {
    let element = await page.$$eval(
      `div.jet-listing-grid__item:nth-child(${i}) > div:nth-child(1) > a:nth-child(2)`,
      (element: any) =>
        element.map((el: { getAttribute: (arg0: string) => any }) =>
          el.getAttribute("href")
        )
    );
    hrefs.push(element);
  }
  hrefs = hrefs.flat().filter(Boolean);

  // console.log(hrefs);
  for (let href of hrefs) {
    const page = await browser.newPage();

    await page.goto(href, { waitUntil: "networkidle0" });

    await page.waitForSelector(
      ".elementor-element-d4b3618 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );

    //! Vehicle Details
    const vinElement = await page.$(
      ".elementor-element-d4b3618 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const odometer_element = await page.$(
      "#jet-tabs-content-4521 > div > section > div > div > div > div > div > div > div > div"
    );
    const transmission_element = await page.$(
      ".elementor-element-60412d7 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const stockElement = await page.$(
      ".elementor-element-135c588 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const interior_color_element = await page.$(
      ".elementor-element-6948e935 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const exterior_color_element = await page.$(
      "#jet-tabs-content-4521 > div > section > div > div > div > strong > div > div > div > div > div"
    );
    const drivetain_element = await page.$(
      ".elementor-element-2aa8539e > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const passenger_element = await page.$(
      ".elementor-element-6be3bb75 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const cover_image = await page.$$eval("img.attachment-large[src]", (imgs) =>
      imgs.map((img) => img.getAttribute("src"))
    );
    const photos_element = await page.$$eval("a.e-gallery-item[href]", (imgs) =>
      imgs.map((img) => img.getAttribute("href"))
    );

    const [price_element] = await page.$x(
      "/html/body/div[2]/section/div/div[2]/div/strong/strong/strong/section[2]/div/div[2]/div/div[1]/div/div/div/div"
    );

    let vin_number = await page.evaluate((el) => el?.textContent, vinElement);
    let stock_number = await page.evaluate(
      (el) => el?.textContent,
      stockElement
    );
    let price = await page.evaluate(
      (el) => el?.textContent?.replace(/\D/g, ""),
      price_element
    );
    let odometer = await page.evaluate(
      (el) => el?.textContent,
      odometer_element
    );
    let transmission = await page.evaluate(
      (el) => el?.textContent,
      transmission_element
    );
    let interior_color = await page.evaluate(
      (el) => el?.textContent,
      interior_color_element
    );

    let exterior_color = await page.evaluate(
      (el) => el?.textContent,
      exterior_color_element
    );

    let passenger = await page.evaluate(
      (el) => el?.textContent,
      passenger_element
    );

    let drivetrain = await page.evaluate(
      (el) => el?.textContent,
      drivetain_element
    );

    console.log("price", price);

    const jsonData: Json = {
      vin: vin_number?.replace("VIN ", "").replace(/[^\x00-\x7F]/g, "") || "",
      price: price || "",
      odometer:
        odometer?.replace("Odometer  ", "").replace(/[^\x00-\x7F]/g, "") || "",
      stock_number:
        stock_number?.replace("Stock# ", "").replace(/[^\x00-\x7F]/g, "") || "",
      interior_color:
        interior_color
          ?.replace("Interior Colour  ", "")
          .replace(/[^\x00-\x7F]/g, "") || "",
      exterior_color:
        exterior_color
          ?.replace("Exterior Colour  ", "")
          .replace(/[^\x00-\x7F]/g, "") || "",
      transmission:
        transmission
          ?.replace("Transmission  ", "")
          .replace(/[^\x00-\x7F]/g, "") || "",
      passenger:
        passenger
          ?.replace("No. of Passengers  ", "")
          .replace(/[^\x00-\x7F]/g, "") || "",
      drivetrain:
        drivetrain?.replace("Drivetrain  ", "").replace(/[^\x00-\x7F]/g, "") ||
        "",
      imgs: [...cover_image, ...photos_element].flat(),
    };

    if (jsonData["exterior_color"]?.includes("Interior Colour"))
      jsonData["exterior_color"] = "";

    json.push({
      ...jsonData,
    });

    await page.close();
  }

  writeFileSync(`premium.json`, JSON.stringify(json), "utf8");

  await page.close();
};

initialisePuppeteer();
