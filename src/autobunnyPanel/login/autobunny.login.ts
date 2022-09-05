import { Browser, Page } from "puppeteer";
import { credentials } from "../../credentials";

export default async function autobunnyLogin(
  username: string | undefined,
  password: string | undefined,
  browser: Browser
): Promise<Page> {
  const page: Page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  );
  await page.goto(credentials.AUTOBUNNY_LOGIN_URL, {
    waitUntil: "networkidle0",
  });

  //! type username pass
  await page.type("#email", username || "");
  await page.type("#passwordGroup > div > input", password || "");

  //! login
  await page.waitForSelector(
    "body > div > div > div.col-xs-12.col-sm-5.col-md-4.login-sidebar > div > form > button"
  );
  await page.click(
    "body > div > div > div.col-xs-12.col-sm-5.col-md-4.login-sidebar > div > form > button"
  );

  await page.goto("https://dealers.autobunny.ca/client/inventory", {
    waitUntil: "domcontentloaded",
  });

  return page;
}
