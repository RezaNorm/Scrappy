import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../interfaces/json.interface";
import { credentials } from "../credentials";
import autobunnyLogin from "./login/autobunny.login";
import autobunnyInventory from "./inventory/autobunny.inventory";
import autobunnySold from "./sold/autobunny.sold";

export default async function scrappyAutobunnyPanel(
  browser: Browser,
  username: string | undefined,
  password: string | undefined
): Promise<{}> {
  const json: { inventory: Json[]; sold: Json[] } = {
    inventory: [],
    sold: [],
  };

  let page: Page | undefined;

  //! Login
  try {
    page = await autobunnyLogin(username, password, browser);
  } catch (error) {
    console.log(error);
    console.log("Login Failed");
  }
  //! invntory
  // try {
  //   json.inventory = await autobunnyInventory(page, browser);
  // } catch (error) {
  //   console.log(error);
  //   console.log("inventory failed");
  // }
  //! sold inventory
  try {
    json.inventory = await autobunnySold(page, browser);
  } catch (error) {
    console.log(error);
    console.log("inventory failed");
  }


  return json;
}
