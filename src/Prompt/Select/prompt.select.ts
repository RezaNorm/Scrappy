import { prompt } from "enquirer";
import { providers } from "../../interfaces/information";
import { PromptChoices } from "../Choices/prompt.choice";
import PromptProvider from "../Provider/prompt.provider";

export default class PromptChoice extends PromptProvider {
  static async selectOption(): Promise<{ provider: string }> {
    return await prompt([
      {
        type: "select",
        name: "provider",
        message: "choose the provider",
        choices: PromptChoices,
      },
    ]);
  }
}
