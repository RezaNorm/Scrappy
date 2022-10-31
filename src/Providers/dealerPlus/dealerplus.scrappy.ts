import { kMaxLength } from "buffer";
import { Browser, Page } from "puppeteer";
import Json from "../../interfaces/json.interface";
export const scrappyDealerplus = async (
  browser: Browser,
  link: string | undefined
): Promise<Json[]> => {
  const page: Page = await browser.newPage();

  const json: Json[] = [];
  let invHrefs: (string | null)[] = [];
  await page.goto(link || "", { waitUntil: "domcontentloaded" });

  const inventoryCount = await page.$eval(
    `#vehicle-results > div.card > div > div > div > div.col-md-4.p-0 > p > strong`,
    (element) => {
      return element.textContent;
    }
  );
  const showing = inventoryCount?.split("of")[0].trim();
  const all = inventoryCount?.split("of")[1].trim();
  console.log("all inventory", all);

  for (let i = 1; i <= +showing!; i++) {
    try {
      await page.waitForSelector(
        `#vehicle-results > div.row.m-0.Vehicles > div:nth-child(${i}) > div > div.Vehicle__info-block.w-100.flex-grow-1.d-flex.flex-column > div.Vehicle-main-info.mt-2.flex-grow-1 > div.Vehicle-btns-block.text-center > a.btn.btn-primary.mb-2.w-100`,
        {
          timeout: 1000,
        }
      );
      const urls = await page.$eval(
        `#vehicle-results > div.row.m-0.Vehicles > div:nth-child(${i}) > div > div.Vehicle__info-block.w-100.flex-grow-1.d-flex.flex-column > div.Vehicle-main-info.mt-2.flex-grow-1 > div.Vehicle-btns-block.text-center > a.btn.btn-primary.mb-2.w-100`,
        (element) => {
          return element.getAttribute("href");
        }
      );
      invHrefs.push(urls);
    } catch (error) {
    //   console.log(error);
      continue;
    }

    if (i === +showing!) {
      try {
        await page.waitForSelector(
          "#vehicle-results > div.card-footer > a.next.page-numbers",
          {
            timeout: 1000,
          }
        );
        await page.click(
          "#vehicle-results > div.card-footer > a.next.page-numbers"
        );
        i = 0;
        continue;
      } catch (error) {
        break;
      }
    }
  }

  try {
    for (const link of invHrefs) {
      const page: Page = await browser.newPage();
      let wholeData: any = {};
      await page.goto(link || "", { waitUntil: "domcontentloaded" });

      //! Get Images
      let images: (string | undefined)[] | null;
      try {
        images = await page.evaluate(() => {
          const imagesUrl = [
            ...new Set(
              Array.from(
                document.querySelectorAll(
                  "#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-5 > div.inventory-gallery-nav-slider.d-print-none.slick-initialized.slick-slider > div > div"
                )
              )
                .map((el) =>
                  Array.from(el.children).map((elm) => {
                    if (
                      parseInt(elm.getAttribute("data-slick-index") || "") >= 0
                    ) {
                      return Array.from(elm.children).map((elem) =>
                        Array.from(elem.children).map((eleme) =>
                          Array.from(eleme.children)
                            .map((element) =>
                              element
                                .getAttribute("src")
                                ?.replace("w=160", "w=1600")
                                .replace("h=120", "h=1200")
                            )
                            .filter((src) => !src?.startsWith("/content"))
                        )
                      );
                    }
                  })
                )
                .flat(4)
                .filter(Boolean)
            ),
          ];

          return imagesUrl;
        });
      } catch (error) {
        console.log(error);
        images = null;
      }

      wholeData["imgs"] = images;

      const price = await page.$eval(
        `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.row.mb-3 > div:nth-child(2) > div > div.col-md-12 > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > p > span.h2.font-weight-bolder`,
        (element) => {
          return element.textContent?.replace(/\D/g, "");
        }
      );
      wholeData["price"] = price;

      const mileage = await page.$eval(
        `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.row.mb-3 > div:nth-child(2) > div > div.col-md-12 > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(2) > strong`,
        (element) => {
          return element.textContent?.replace(/\D/g, "");
        }
      );

      const unit = await page.$eval(
        `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.row.mb-3 > div:nth-child(2) > div > div.col-md-12 > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(2) > span:nth-child(6)`,
        (element) => {
          return element.textContent?.replace(/\D/g, "");
        }
      );

      const odometer = `${mileage?.replace(/\D/g, "")} ${unit?.toLowerCase()}`;

      wholeData["odometer"] = odometer;

      try {
        const vin = await page.$eval(
          `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div:nth-child(1) > div:nth-child(2) > div > div.col-md-12 > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(2) > span`,
          (element) => {
            return element.textContent;
          }
        );
        wholeData["vin"] = vin;
      } catch (error) {
        continue;
      }

      let stock, description;
      try {
        stock = await page.$eval(
          `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div:nth-child(1) > div:nth-child(2) > div > div.col-md-12 > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(3)`,
          (element) => {
            return element.textContent?.replace(" Stock No:", "").trim();
          }
        );
        wholeData["stock_number"] = stock;
      } catch (error) {
        stock = "";
      }

      try {
        description = await page.$eval(
          `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div:nth-child(2) > div > div > div > div`,
          (element) => {
            return element.innerHTML;
          }
        );
      } catch (error) {
        description = "";
      }

      wholeData["description"] = description;

      for (let i = 1; i <= 11; i++) {
        try {
          await page.waitForSelector(
            `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.card > div > div > dl:nth-child(${i}) > dt`,
            { timeout: 500 }
          );

          await page.waitForSelector(
            `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.card > div > div > dl:nth-child(${i}) > dd > ul`,
            {
              timeout: 500,
            }
          );

          const key = await page.$eval(
            `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.card > div > div > dl:nth-child(${i}) > dt`,
            (element) => {
              return element.textContent?.trim();
            }
          );

          const value = await page.$eval(
            `#main > div.container.container-dsp > div:nth-child(2) > div.col-lg-7 > div.card > div > div > dl:nth-child(${i}) > dd > ul`,
            (element) => {
              return element.textContent?.replace("-", " ").trim();
            }
          );
          wholeData[key || ""] = value || "";
        } catch (error) {
        //   console.log(error);
          break;
        }
      }

      json.push(wholeData);
      await page.close();
    }
  } catch (error) {
    console.log(error);
  }

  await page.close();
  return json;
};
