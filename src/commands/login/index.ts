import chalk from "chalk";
import dotenv from "dotenv";
import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import getPort, { portNumbers } from "get-port";
import { apiCliLogin } from "../../services/index.js";
import { browser, cancelOperation, commandNote, dispatchConfig, errorHandler, isConfigExists } from "../../helper/index.js";

dotenv.config();

type TBrowserLoginResponse = { token: string };

export default class Login extends Command {
  static description = "Login";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    if (isConfigExists()) cancelOperation({ message: messages.login.error });

    const spinner = p.spinner();

    try {
      const port = await getPort({ port: portNumbers(3001, 3100) });
      const options = { port, spinner, url: "/api/cli/verify-login", waitingMessage: messages.login.waiting };
      const { token } = await browser<TBrowserLoginResponse>(options);
      const { data } = await apiCliLogin({ headers: { authorization: token } });
      dispatchConfig(data.token);
      spinner.stop(messages.login.success);
      const description = [
        "Connect your project.",
        "Run the connect command:",
        `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("connect")}`,
      ];
      commandNote({ description, title: messages.nextStep });
    } catch (error) {
      errorHandler(spinner)(error);
    }
  }
}
