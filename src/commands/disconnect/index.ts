import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import { deleteLock } from "../../helper/index";

export default class Disconnect extends Command {
  static description = "Disconnect";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start("loading 🔁");

    deleteLock();

    sp.stop("Project disconnected ✅");
  }
}
