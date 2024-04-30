import * as p from "@clack/prompts";
import { Command, Flags } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliProjectEnvs, apiCliPull } from "../../services/index.js";
import { cancelOperation, dispatchEnvContent, errorHandler, getLock } from "../../helper/index.js";

export default class Pull extends Command {
  static description = "Pull";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = { list: Flags.boolean({ char: "l" }) };

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start(messages.loading);

    const token = getLock();

    const { flags } = await this.parse(Pull);

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

        await apiCliPull(token, env.toString())
          .then(async ({ data }) => {
            await dispatchEnvContent(data.env.content);
            sp.stop(messages.env.pulled);
          })
          .catch(errorHandler(sp));
      } else cancelOperation(p);
    } else {
      await apiCliPull(token, "")
        .then(async ({ data }) => {
          await dispatchEnvContent(data.env.content);
          sp.stop(messages.env.pulled);
        })
        .catch(errorHandler(sp));
    }
  }
}
