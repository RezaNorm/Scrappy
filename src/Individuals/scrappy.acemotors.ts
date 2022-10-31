// const express = require("express");
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import Json from "../interfaces/json.interface";
import { writeFileSync } from "fs";
import axios from "axios";

const DEALERSHIP_URL = "https://acemotorsbc.ca/inventory-2/";

const initialiseScrappy = async (): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const json: Json[] = [];
  const hRefs = [];

  const page: Page = await browser.newPage();

  await page.goto(DEALERSHIP_URL, { waitUntil: "domcontentloaded" });

  //#listings-result > div.stm-isotope-sorting.stm-isotope-sorting-list > div:nth-child(1) > div.content > a
  //#listings-result > div.stm-isotope-sorting.stm-isotope-sorting-list > div:nth-child(2) > div.content > a

  for (let i = 1; i <= 10; i++) {
    try {
      await page?.waitForSelector(
        `#listings-result > div.stm-isotope-sorting.stm-isotope-sorting-list > div:nth-child(${i}) > div.content > a`
      );
    } catch (error) {
      break;
    }
    const vLink = await page?.$$eval(
      `#listings-result > div.stm-isotope-sorting.stm-isotope-sorting-list > div:nth-child(${i}) > div.content > a`,
      (element: any) => element.map((el: any) => el?.getAttribute("href"))[0]
    );
    hRefs.push(vLink);

    if (i === 10) {
      try {
        const button = await page?.$("#listings-result > div.stm_ajax_pagination.stm-blog-pagination > ul > li:nth-child(5) > a");
        await button?.evaluate((b: any) => b.click());
        await page?.waitForSelector(
          `#listings-result > div.stm-isotope-sorting.stm-isotope-sorting-list > div:nth-child(${i}) > div.content > a`
        );
        i = 0
        continue
      } catch (error) {
        break;
      }
    }
  }

  return;
};

(async () => await initialiseScrappy())();
