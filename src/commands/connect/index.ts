import chalk from "chalk";
import * as p from "@clack/prompts";
import { Args, Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { apiCliUserWorkspaces, apiCliWorkspaceProjects } from "../../services/index.js";
import { cancelOperation, commandNote, dispatchLock, errorHandler } from "../../helper/index.js";

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
      dispatchLock(token);
      spinner.stop(messages.project.remote);
      // note
      const description = [
        "You can pull the latest changes too.",
        "Run the pull command:",
        `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")}`,
        "Or run:",
        `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")} YOUR_CUSTOM_ENV_NAME`,
      ];
      commandNote({ description, title: messages.nextStep });
    } else {
      const workspaces = await apiCliUserWorkspaces()
        .then(({ data }) => data.workspaces)
        .catch(errorHandler(spinner));

      if (workspaces) {
        if (workspaces.length === 0) cancelOperation({ spinner, message: messages.workspace.notFound });

        const workspace = await p.select({
          initialValue: workspaces[0].id,
          message: messages.workspace.select,
          options: workspaces.map(({ id, name }) => ({ value: id, label: name })),
        });

        if (p.isCancel(workspace)) cancelOperation({ spinner });

        const projects = await apiCliWorkspaceProjects(workspace as number)
          .then(({ data }) => data.projects)
          .catch(errorHandler(spinner));

        if (projects) {
          if (projects.length === 0) cancelOperation({ spinner, message: messages.project.notFound });

          const project = await p.select({
            initialValue: projects[0].id,
            message: messages.project.select,
            options: projects.map(({ id, name }) => ({ value: id, label: name })),
          });

          if (p.isCancel(project)) cancelOperation({ spinner });

          const { name, token } = projects.find((item) => item.id === project)!;

          dispatchLock(token);

          spinner.stop(`${name} now selected ✅`);
        } else cancelOperation({ spinner });
      } else cancelOperation({ spinner });

      // note
      const description = [
        "You can pull the latest changes too.",
        "Run the pull command:",
        `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")}`,
        "Or run:",
        `${chalk.whiteBright("$ gitoq")} ${chalk.greenBright("pull")} YOUR_CUSTOM_ENV_NAME`,
      ];
      commandNote({ description, title: messages.nextStep });
    }
  }
}
