import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { NeedHelpDescription, deleteLock } from "../../helper/index.js";

export default class Disconnect extends Command {
  static description = NeedHelpDescription;
  static examples = ["<%= config.bin %> <%= command.id %>"];
  static summary = "Disconnect your project to local workspace";

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    deleteLock();

    spinner.stop(messages.project.disconnected);
    p.log.message();
  }
}
