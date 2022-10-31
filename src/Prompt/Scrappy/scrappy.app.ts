import { Browser } from "puppeteer";
import scrappyV12 from "../../Providers/V12Panel/scrappy.V12Panel";
import { scrappyMvic } from "../../Providers/mvic/scrappy.mvic";
import { scrappyAutobunny } from "../../Providers/autobunny/autobunny.website";
import scrappyAutobunnyPanel from "../../Providers/autobunnyPanel/scrappy.autobunny";
import { scrappyV12Website } from "../../Providers/V12Website/scrappy.V12Website";
import { scrappyZop } from "../../Providers/zop/zop.scrappy";
import { scrappyDealerplus } from "../../Providers/dealerPlus/dealerplus.scrappy";
import { carpagesScrappy } from "../../Providers/carpages/scrappy.mrmemo.carpages";

export class Scrappy {
  constructor(
    private readonly provider: string,
    private readonly browser: Browser,
    private readonly link?: string,
    private readonly username?: string,
    private readonly password?: string
  ) {}

  async runScrappy() {
    let json: any;
    switch (this.provider) {
      case "v12panel": {
        try {
          json = await scrappyV12(this.browser, this.username, this.password);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case "mvic": {
        try {
          json = await scrappyMvic(this.browser, this.link);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case "autobunny": {
        try {
          json = await scrappyAutobunny(this.browser, this.link);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case "autobunnypanel": {
        try {
          json = await scrappyAutobunnyPanel(
            this.browser,
            this.username,
            this.password
          );
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case "v12": {
        try {
          json = await scrappyV12Website(this.browser, this.link);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case "zop": {
        try {
          json = await scrappyZop(this.browser, this.link);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case "dealerplus":
        {
          try {
            json = await scrappyDealerplus(this.browser, this.link);
          } catch (error) {
            console.log(error);
          }
        }
        break;
      case "carpages": {
        try {
          json = await carpagesScrappy(this.browser, this.link);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      default:
        {
             console.log("provider not set-up");
        }
        break;
    }
    return json;
  }
}
