import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliLogout } from "../../services/index.js";
import { NeedHelpDescription, cancelOperation, deleteConfig } from "../../helper/index.js";

export default class Logout extends Command {
  static description = NeedHelpDescription;
  static examples = ["<%= config.bin %> <%= command.id %>"];
  static summary = "If you're using multiple devices, make sure to logout to protect your privacy.";

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    await apiCliLogout()
      .then(({ data }) => {
        deleteConfig();
        spinner.stop(data.message);
      })
      .catch((error) => cancelOperation({ spinner, message: error.message }));
    p.log.message();
  }
}
