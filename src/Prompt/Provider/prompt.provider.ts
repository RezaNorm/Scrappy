import { providers } from "../../interfaces/information";
import { prompt } from "enquirer";

export default class PromptProvider {
  async checkProvider(provider: string): Promise<object | undefined> {
    const chosenProvider: string = provider

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
