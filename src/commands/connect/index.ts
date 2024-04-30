import * as p from "@clack/prompts";
import { Args, Command } from "@oclif/core";
import messages from "../../messages/index.js";
import { cancelOperation, dispatchLock, errorHandler } from "../../helper/index.js";
import { apiCliUserWorkspaces, apiCliWorkspaceProjects } from "../../services/index.js";

export default class Connect extends Command {
  static args = { token: Args.string() };

  static description = "Connect";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start(messages.loading);

    const { args } = await this.parse(Connect);
    const { token } = args;

    if (token) {
      dispatchLock(token);

      sp.stop(messages.project.remote);
    } else {
      const workspaces = await apiCliUserWorkspaces()
        .then(({ data }) => data.workspaces)
        .catch(errorHandler(sp));

      sp.stop();

      if (workspaces) {
        if (workspaces.length === 0) cancelOperation(p, messages.workspace.notFound);

        const workspace = await p.select({
          initialValue: workspaces[0].id,
          message: messages.workspace.select,
          options: workspaces.map(({ id, name }) => ({ value: id, label: name })),
        });

        if (p.isCancel(workspace)) cancelOperation(p);

        sp.start(messages.loading);

        const projects = await apiCliWorkspaceProjects(workspace as number)
          .then(({ data }) => data.projects)
          .catch(errorHandler(sp));

        sp.stop();

        if (projects) {
          if (projects.length === 0) cancelOperation(p, messages.project.notFound);

          const project = await p.select({
            initialValue: projects[0].id,
            message: messages.project.select,
            options: projects.map(({ id, name }) => ({ value: id, label: name })),
          });

          if (p.isCancel(project)) cancelOperation(p);

          const { name, token } = projects.find((item) => item.id === project)!;

          dispatchLock(token);

          sp.stop(`${name} now selected ✅`);
        } else cancelOperation(p);
      } else cancelOperation(p);
    }
  }
}
