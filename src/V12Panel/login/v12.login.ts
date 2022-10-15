import { Browser, Page } from "puppeteer";
import { credentials } from "../../information";

export default async function v12Login(
  username: string | undefined,
  password: string | undefined,
  browser: Browser
): Promise<Page> {
  const page: Page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  );
  await page.goto(credentials.V12_LOGIN_URL, { waitUntil: "networkidle0" });

  //! type username pass
  //driveoncanada@gmail.com
  //Onlyme2310!
  await page.type("input[type='email']", username || "");
  await page.type("input[type='password']", password || "");

  //! submit
  await page.waitForSelector(
    "#app > div:nth-child(1) > div.undefined > section > div:nth-child(1) > div > form > button"
  );
  await page.click(
    "#app > div:nth-child(1) > div.undefined > section > div:nth-child(1) > div > form > button"
  );

  //! click on inventory when it shows
  await page.waitForSelector("#Menu > ul > li:nth-child(7) > a");
  await page.click("#Menu > ul > li:nth-child(7) > a");
  return page;
}
