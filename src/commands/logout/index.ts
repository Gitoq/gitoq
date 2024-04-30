import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliLogout } from "../../services/index.js";
import { deleteConfig, errorHandler } from "../../helper/index.js";

export default class Logout extends Command {
  static description = "Logout";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    await apiCliLogout()
      .then(({ data }) => {
        deleteConfig();
        spinner.stop(data.message);
      })
      .catch(errorHandler(spinner));
    p.log.message();
  }
}
