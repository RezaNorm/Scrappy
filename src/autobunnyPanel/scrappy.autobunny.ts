import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../interfaces/json.interface";
import { credentials } from "../information";
import autobunnyLogin from "./login/autobunny.login";
import autobunnyInventory from "./inventory/autobunny.inventory";
import autobunnySold from "./sold/autobunny.sold";
import autobunnyCustomers from "./customers/autobunny.customers";

type json = {
  inventory: { active: Json[]; deactive: Json[] };
  sold: { active: Json[]; deactive: Json[] };
  customers: Object[];
};

export default async function scrappyAutobunnyPanel(
  browser: Browser,
  username: string | undefined,
  password: string | undefined
): Promise<{}> {
  const json: json = {
    inventory: { active: [], deactive: [] },
    sold: { active: [], deactive: [] },
    customers: [],
  };

  let page: Page | undefined;

  //! Login
  try {
    page = await autobunnyLogin(username, password, browser);
  } catch (error) {
    console.log(error);
    console.log("Login Failed");
  }
  // //! invntory
  try {
    console.log("getting inventory");
    json.inventory = await autobunnyInventory(
      page,
      browser,
      username,
      password
    );
  } catch (error) {
    console.log(error);
    console.log("inventory failed");
  }
  // //! sold inventory
  // try {
  //   console.log("getting sold inventory");
  //   json.sold = await autobunnySold(page, browser, username, password);
  // } catch (error) {
  //   console.log(error);
  //   console.log("inventory failed");
  // }
  // //! Customers
  // try {
  //   console.log("getting customers");
  //   json.customers = await autobunnyCustomers(
  //     page,
  //     browser,
  //     username,
  //     password
  //   );
  // } catch (error) {
  //   console.log(error);
  //   console.log("customers failed");
  // }
  return json;
}
