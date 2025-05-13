import * as p from "@clack/prompts";
import { Command } from "@oclif/core";

export default class Version extends Command {
  static summary = "Displays the current version";
  static aliases = ["-v"];
  static hidden = true;

  async run(): Promise<void> {
    p.outro(this.config.version);
  }
}
