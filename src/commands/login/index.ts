import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import getPort, { portNumbers } from "get-port";
import { encrypt } from "../../helper/crypto.js";
import { apiCliLogin } from "../../services/index.js";
import { browser, configEnv, dispatchConfig, errorHandler } from "../../helper/index.js";

configEnv();

type TBrowserLoginResponse = { token: string };

export default class Login extends Command {
  static description = "Login";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    p.intro("Welcome to Gitoq CLI! 🚀");
    const sp = p.spinner();
    sp.start("Opening browser 🔁");

    try {
      const port = await getPort({ port: portNumbers(3001, 3100) });
      const query = `callback-api=http://localhost:${port}/callback`;
      const url = `${process.env.VERIFY_TRANSFER_WORKSPACE_CALLBACK_ROUTE}?${await encrypt("CLI", query)}`;
      const { token } = await browser<TBrowserLoginResponse>({ sp, url, port });
      await apiCliLogin({ headers: { authorization: token } })
        .then(({ data }) => {
          dispatchConfig(data.token);
          sp.stop("welcome 🎉");
        })
        .catch(errorHandler(sp));
    } catch (error) {
      errorHandler(sp)(error);
    }
  }
}
