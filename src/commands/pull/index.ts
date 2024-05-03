import chalk from "chalk";
import * as p from "@clack/prompts";
import { Command, Flags } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliProjectEnvs, apiCliPull } from "../../services/index.js";
import { NeedHelpDescription, cancelOperation, dispatchEnvContent, getLock, replaceMessage } from "../../helper/index.js";

export default class Pull extends Command {
  static description = NeedHelpDescription;
  static examples = ["<%= config.bin %> <%= command.id %>"];
  static flags = { list: Flags.boolean({ char: "l" }) };

  static summary = "Get changes of env to local workspace";

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    const { token } = getLock(spinner);

    const { flags } = await this.parse(Pull);

    if (flags.list) {
      const envs = await apiCliProjectEnvs(token)
        .then((res) => res.data.envs)
        .catch((error) => cancelOperation({ spinner, message: error.message }));
      spinner.stop(messages.env.checked);

      if (envs) {
        const env = await p.select({
          initialValue: envs[0].id,
          message: messages.env.select,
          options: envs.map(({ id, name }) => ({ value: id, label: name })),
        });

        if (p.isCancel(env)) cancelOperation({ spinner });

        spinner.start(messages.loading);

        await apiCliPull(token, env.toString())
          .then(async ({ data }) => {
            const path = await dispatchEnvContent(data);
            const message = replaceMessage(messages.env.pulled, [
              { key: "path", value: path },
              { key: "name", value: chalk.whiteBright(`'${data.env.name}'`) },
            ]);
            spinner.stop(message);
          })
          .catch((error) => cancelOperation({ spinner, message: error.message }));
      } else cancelOperation({ spinner });
    } else {
      await apiCliPull(token, "")
        .then(async ({ data }) => {
          const path = await dispatchEnvContent(data);
          const message = replaceMessage(messages.env.pulled, [
            { key: "path", value: path },
            { key: "name", value: chalk.whiteBright(`'${data.env.name}'`) },
          ]);
          spinner.stop(message);
        })
        .catch((error) => cancelOperation({ spinner, message: error.message }));
    }

    p.log.message();
  }
}
