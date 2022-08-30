import { promptDto } from "./prompt.dto";
import { prompt } from "enquirer";

export default class promptChoice {
  static async selectOption(): Promise<{ provider: string }> {
    return await prompt([
      {
        type: "select",
        name: "provider",
        message: "choose the provider",
        choices: [
          { name: "v12", message: "V12" },
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
        ],
      },
    ]);
  }

  async checkProvider(provider: {
    provider: string;
  }): Promise<object | undefined> {
    const chosenProvider: string = provider["provider"];
    console.log(chosenProvider)
    if (chosenProvider === "v12" || chosenProvider === "autobunny") {
      return await prompt([
        {
          type: "input",
          name: "link",
          message: "Write website address",
        },
      ]);
    }
    if (chosenProvider === "v12panel" || chosenProvider === "autobunnypanel") {
      return await prompt([
        {
          type: "input",
          name: "username",
          message: "Write username",
        },
        {
          type: "input",
          name: "password",
          message: "Write password",
        },
      ]);
    }
  }
}
