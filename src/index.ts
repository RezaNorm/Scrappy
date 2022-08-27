// const express = require("express");
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "./json.interface";
import { writeFileSync } from "fs";
import { resolve } from "path";

const DEALERSHIP_URL = "https://premiumdrive.ca/vehicles/";

const initialisePuppeteer = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const json: Json[] = [];

  const page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { waitUntil: "networkidle0" });

  for (let i = 0; i <= 6; i++) {
    await scrollPageToBottom(page, { size: 500, delay: 250 });
  }

  let hrefs = [];
  for (let i = 3; i <= 78; i++) {
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

  for (let href of hrefs) {
    const page = await browser.newPage();

    await page.goto(href, { waitUntil: "networkidle0" });

    await page.waitForSelector(
      ".elementor-element-d4b3618 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
    const vinElement = await page.$(
      ".elementor-element-d4b3618 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
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
    const drivetain_element = await page.$(
      ".elementor-element-2aa8539e > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );

    const passenger_element = await page.$(
      ".elementor-element-6be3bb75 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );

    const cover_element = await page.$$eval(
      `.attachment-large`,
      (element: any) =>
        element.map((el: { getAttribute: (arg0: string) => any }) =>
          el.getAttribute("href")
        )
    );

    const vin_number = await page.evaluate((el) => el?.textContent, vinElement);
    const stock_number = await page.evaluate(
      (el) => el?.textContent,
      stockElement
    );
    const transmission = await page.evaluate(
      (el) => el?.textContent,
      transmission_element
    );
    const interior_color = await page.evaluate(
      (el) => el?.textContent,
      interior_color_element
    );

    const passenger = await page.evaluate(
      (el) => el?.textContent,
      passenger_element
    );

    const drivetrain = await page.evaluate(
      (el) => el?.textContent,
      drivetain_element
    );

    const photosCount = await page.$$eval(
      `a.e-gallery-item`,
      (element: any) => element.length
    );

    const photos: string[] = [];

    for (let i = 1; i <= photosCount; i++) {
      const photos_element = await page.$$eval(
        `a.e-gallery-item:nth-child(${i})`,
        (element: any) =>
          element.map((el: { getAttribute: (arg0: string) => any }) =>
            el.getAttribute("src")
          )
      );
      photos.push(photos_element);
    }

    json.push({
      vin: vin_number || "",
      stock_number: stock_number || "",
      interior_color: interior_color || "",
      transmission: transmission || "",
      passenger: passenger || "",
      drivetrain: drivetrain || "",
      imgs: [cover_element, ...photos],
    });

    await page.close();
  }

  writeFileSync(`premium.json`, JSON.stringify(json));

  await page.close();
};

initialisePuppeteer();
