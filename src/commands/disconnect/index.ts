import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { deleteLock } from "../../helper/index.js";

export default class Disconnect extends Command {
  static description = "Disconnect";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    deleteLock();

    spinner.stop(messages.project.disconnected);
    p.log.message();
  }
}
