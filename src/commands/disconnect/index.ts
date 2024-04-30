import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { deleteLock } from "../../helper/index.js";

export default class Disconnect extends Command {
  static description = "Disconnect";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start(messages.loading);

    deleteLock();

    sp.stop(messages.project.disconnected);
  }
}
