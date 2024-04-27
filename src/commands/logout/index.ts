import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import { apiCliLogout } from "../../services/index.js";
import { deleteConfig, errorHandler } from "../../helper/index.js";

export default class Login extends Command {
  static description = "Logout";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start("loading 🔁");

    await apiCliLogout()
      .then(({ data }) => {
        deleteConfig();
        sp.stop(data.message);
      })
      .catch(errorHandler(sp));
  }
}
