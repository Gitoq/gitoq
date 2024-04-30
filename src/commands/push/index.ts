import * as p from "@clack/prompts";
import { Command, Flags } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliProjectEnvs, apiCliPush } from "../../services/index.js";
import { cancelOperation, errorHandler, getEnvContent, getLock } from "../../helper/index.js";

export default class Push extends Command {
  static description = "Push";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = { list: Flags.boolean({ char: "l" }) };

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start(messages.loading);

    const token = getLock();
    const content = await getEnvContent();

    const { flags } = await this.parse(Push);

    if (flags.list) {
      const envs = await apiCliProjectEnvs(token)
        .then((res) => res.data.envs)
        .catch(errorHandler(sp));

      sp.stop();

      if (envs) {
        const env = await p.select({
          initialValue: envs[0].id,
          message: messages.env.select,
          options: envs.map(({ id, name }) => ({ value: id, label: name })),
        });

        sp.start(messages.loading);

        await apiCliPush(token, env.toString(), { content })
          .then(() => sp.stop(messages.env.pushed))
          .catch(errorHandler(sp));
      } else cancelOperation(p);
    } else {
      await apiCliPush(token, "", { content })
        .then(() => sp.stop(messages.env.pushed))
        .catch(errorHandler(sp));
    }
  }
}
