import { promptDto } from "./prompt.dto";
import { prompt } from "enquirer";
import { providers } from "../information";

export default class promptChoice {
  static async selectOption(): Promise<{ provider: string }> {
    return await prompt([
      {
        type: "select",
        name: "provider",
        message: "choose the provider",
        choices: [
          { name: "v12", message: "V12" },
          { name: "mvic", message: "MVIC" },
          { name: "carpages", message: "Carpages" },
          {
            name: "autobunny",
            value: "Autobunny",
          },
          {
            name: "autobunnypanel",
            message: "Autobunny Panel",
          },
          {
            name: "v12panel",
            message: "V12 Panel",
          },
          {
            name: "zop",
            message: "Zop Dealer",
          },
          {
            name: "dealerplus",
            message: "Dealersite+",
          },
        ],
      },
    ]);
  }

  async checkProvider(provider: {
    provider: string;
  }): Promise<object | undefined> {
    
    const chosenProvider: string = provider["provider"];

    if (providers.includes(chosenProvider)) {
      return await prompt([
        {
          type: "input",
          name: "link",
          message: "inventory address",
        },
      ]);
    }
    if (chosenProvider === "v12panel" || chosenProvider === "autobunnypanel") {
      return await prompt([
        {
          type: "input",
          name: "username",
          message: "username",
        },
        {
          type: "input",
          name: "password",
          message: "password",
        },
      ]);
    }
  }

  static async fileName(): Promise<{ fileName: string }> {
    return await prompt([
      {
        type: "input",
        name: "fileName",
        message: "output file name",
      },
    ]);
  }
}
