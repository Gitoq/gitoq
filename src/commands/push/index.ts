import chalk from "chalk";
import * as p from "@clack/prompts";
import { Command, Flags } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliProjectEnvs, apiCliPush } from "../../services/index.js";
import { NeedHelpDescription, cancelOperation, commandNote, getEnvContent, getLock } from "../../helper/index.js";

const description = [
  "You can get the latest changes of your main env.",
  "Please run the pull command:",
  `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")}`,
  "Or get a list of your envs:",
  `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")} -l`,
];

export default class Push extends Command {
  static description = NeedHelpDescription;
  static examples = ["<%= config.bin %> <%= command.id %>"];
  static flags = { list: Flags.boolean({ char: "l" }) };
  static summary = "Set changes of local workspace to env";

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    const { token } = getLock(spinner);
    const content = await getEnvContent(spinner);

    const { flags } = await this.parse(Push);

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

        await apiCliPush(token, env.toString(), { content })
          .then(({ data }) => {
            spinner.stop(messages.env.pushed.replace("{name}", chalk.whiteBright(`'${data.env.name}'`)));
            commandNote({ description, title: messages.nextStep });
          })
          .catch((error) => cancelOperation({ spinner, message: error.message }));
      } else cancelOperation({ spinner });
    } else {
      await apiCliPush(token, "", { content })
        .then(({ data }) => {
          spinner.stop(messages.env.pushed.replace("{name}", chalk.whiteBright(`'${data.env.name}'`)));
          commandNote({ description, title: messages.nextStep });
        })
        .catch((error) => cancelOperation({ spinner, message: error.message }));
    }

    p.log.message();
  }
}
