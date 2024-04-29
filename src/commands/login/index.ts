import chalk from "chalk";
import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import getPort, { portNumbers } from "get-port";
import { apiCliLogin } from "../../services/index.js";
import { browser, cancelOperation, dispatchConfig, errorHandler, isConfigExists } from "../../helper/index.js";

type TBrowserLoginResponse = { token: string };

export default class Login extends Command {
  static description = "Login";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    if (isConfigExists()) cancelOperation(p, "You are already logged in");

    const sp = p.spinner();

    try {
      const port = await getPort({ port: portNumbers(3001, 3100) });
      const options = { sp, port, url: "/api/cli/verify-login", waitingMessage: "Waiting for login 🔁" };
      const { token } = await browser<TBrowserLoginResponse>(options);
      const { data } = await apiCliLogin({ headers: { authorization: token } });
      dispatchConfig(data.token);
      sp.stop("Logged to Gitoq CLI 🚀");
      const noteDescription = `Connect your project.        \nRun the connect command:        \n${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("connect")}`;
      p.note(noteDescription, chalk.bold("Next step"));
    } catch (error) {
      errorHandler(sp)(error);
    }
  }
}
