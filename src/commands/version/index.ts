import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import { getVersion } from "../../helper/index.js";

export default class Version extends Command {
  static hidden = true;
  static summary = "version";
  async run(): Promise<void> {
    const version = getVersion();
    p.outro(version);
  }
}
