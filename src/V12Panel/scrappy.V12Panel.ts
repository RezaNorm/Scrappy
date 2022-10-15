import { writeFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { Page, EvaluateFunc, ElementHandle, Browser } from "puppeteer";
import Json from "../interfaces/json.interface";
import { credentials } from "../credentials";
import V12Unpublished from "./Unpublished/v12.unpublished";
import v12Login from "./login/v12.login";
import v12Published from "./Published/v12.published";
import V12Published from "./Published/v12.published";
import V12Sold from "./Sold/v12.sold";
import V12Customers from "./customers/v12.customers";

export default async function scrappyV12(
  browser: Browser,
  username: string | undefined,
  password: string | undefined
): Promise<{}> {
  const json: {
    unpublished: Json[];
    published: Json[];
    sold: Json[];
    customers: Object[];
  } = {
    unpublished: [],
    published: [],
    sold: [],
    customers: [],
  };

  let page: Page | undefined;

  //! Login
  try {
    page = await v12Login(username, password, browser);
  } catch (error) {
    console.log("Login Failed");
  }
  //! un-published inv
  // try {
  //   json.unpublished = await V12Unpublished(page, browser);
  //   if (json.unpublished.length) console.log("Unpublished Inv Finished");
  // } catch (error) {
  //   console.log("error in unpublished inventory", error);
  // }
  // //! click on published
  // try {
  //   json.published = await V12Published(page, browser);
  //   if (json.published.length) console.log("Published Inv Finished");
  // } catch (error) {
  //   console.log("error in published inventory", error);
  // }
  //! click on sold
  try {
    json.sold = await V12Sold(page, browser);
    if (json.sold.length) console.log("Sold Inv Finished");
  } catch (error) {
    console.log("Sold Inv Has error", error);
  }
  // try {
  //   json.customers = await V12Customers(page, browser);
  //   if (json.customers.length) console.log("Customers Finished");
  // } catch (error) {
  //   console.log("customers Has error", error);
  // }

  return json;
}
