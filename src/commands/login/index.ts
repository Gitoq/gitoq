import chalk from "chalk";
import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import messages from "../../messages/index.js";
import getPort, { portNumbers } from "get-port";
import { apiCliLogin } from "../../services/index.js";
import {
  NeedHelpDescription,
  browser,
  cancelOperation,
  commandNote,
  dispatchConfig,
  isConfigExists,
} from "../../helper/index.js";

type TBrowserLoginResponse = { token: string };

const description = [
  "Now you need to connect your project.",
  "Please run the connect command:",
  `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("connect")}`,
];

export default class Login extends Command {
  static description = NeedHelpDescription;
  static examples = ["<%= config.bin %> <%= command.id %>"];
  static summary = "Login your gitoq account";

  async run(): Promise<void> {
    const spinner = p.spinner();

    if (isConfigExists()) {
      spinner.start(messages.loading);
      cancelOperation({ spinner, message: messages.login.error });
    }

    try {
      const port = await getPort({ port: portNumbers(7001, 7100) });
      const options = { port, spinner, url: "/api/cli/verify-login", waitingMessage: messages.login.waiting };
      const { token } = await browser<TBrowserLoginResponse>(options);
      const { data } = await apiCliLogin({ headers: { authorization: token } });
      dispatchConfig(data.token);
      spinner.stop(messages.login.success);
      commandNote({ description, title: messages.nextStep });
    } catch (error) {
      cancelOperation({ spinner, message: error.message });
    }
  }
}
