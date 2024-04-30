import chalk from "chalk";
import * as p from "@clack/prompts";
import { Args, Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { cancelOperation, commandNote, dispatchLock } from "../../helper/index.js";
import { apiCliUserWorkspaces, apiCliWorkspaceProjects } from "../../services/index.js";

const description = [
  "You can pull the latest changes too.",
  "Run the pull command:",
  `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")}`,
  "Or run:",
  `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")} YOUR_CUSTOM_ENV_NAME`,
];

export default class Connect extends Command {
  static args = { token: Args.string() };

  static description = "Connect";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const spinner = p.spinner();
    spinner.start(messages.loading);

    const { args } = await this.parse(Connect);
    const { token } = args;

    if (token) {
      dispatchLock([{ key: "token", value: token }]);
      spinner.stop(messages.project.remote);
      commandNote({ description, title: messages.nextStep });
    } else {
      const workspaces = await apiCliUserWorkspaces()
        .then(({ data }) => data.workspaces)
        .catch((error) => cancelOperation({ spinner, message: error.message }));

      if (workspaces) {
        if (workspaces.length === 0) cancelOperation({ spinner, message: messages.workspace.notFound });
        else spinner.stop(messages.workspace.checked);

        const workspace = await p.select({
          initialValue: workspaces[0].id,
          message: messages.workspace.select,
          options: workspaces.map(({ id, name }) => ({ value: id, label: name })),
        });

        if (p.isCancel(workspace)) cancelOperation({ spinner });

        spinner.start(messages.loading);
        const projects = await apiCliWorkspaceProjects(workspace as number)
          .then(({ data }) => data.projects)
          .catch((error) => cancelOperation({ spinner, message: error.message }));

        if (projects) {
          if (projects.length === 0) cancelOperation({ spinner, message: messages.project.notFound });
          else spinner.stop(messages.project.checked);

          const project = await p.select({
            initialValue: projects[0].id,
            message: messages.project.select,
            options: projects.map(({ id, name }) => ({ value: id, label: name })),
          });

          if (p.isCancel(project)) cancelOperation({ spinner });

          const { name, token } = projects.find((item) => item.id === project)!;
          dispatchLock([{ key: "token", value: token }]);

          p.log.message();
          spinner.stop(`${name} ${messages.project.selected}`);
        } else cancelOperation({ spinner });
      } else cancelOperation({ spinner });

      commandNote({ description, title: messages.nextStep });
    }
  }
}
