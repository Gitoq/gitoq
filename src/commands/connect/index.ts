import * as p from "@clack/prompts";
import { Command, Args } from "@oclif/core";
import { cancelOperation, dispatchLock, errorHandler } from "../../helper/index";
import { apiCliUserWorkspaces, apiCliWorkspaceProjects } from "../../services/index";

export default class Connect extends Command {
  static description = "Connect";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static args = { token: Args.string() };

  async run(): Promise<void> {
    const sp = p.spinner();
    sp.start("loading 🔁");

    const { args } = await this.parse(Connect);
    const token = args.token;

    if (token) {
      dispatchLock(token);

      sp.stop("Remote added ✅");
    } else {
      const workspaces = await apiCliUserWorkspaces()
        .then(({ data }) => data.workspaces)
        .catch(errorHandler(sp));

      sp.stop();

      if (workspaces) {
        if (!workspaces.length) cancelOperation(p, "You don't have any workspaces containing at least one project !");

        const workspace = await p.select({
          message: "Select a workspace",
          initialValue: workspaces[0].id,
          options: workspaces.map(({ id, name }) => ({ label: name, value: id })),
        });

        if (p.isCancel(workspace)) cancelOperation(p);

        sp.start("loading 🔁");

        const projects = await apiCliWorkspaceProjects(workspace as number)
          .then(({ data }) => data.projects)
          .catch(errorHandler(sp));

        sp.stop();

        if (projects) {
          if (!projects.length) cancelOperation(p, "There are no projects in this workspace !");

          const project = await p.select({
            message: "Select a project",
            initialValue: projects[0].id,
            options: projects.map(({ id, name }) => ({ label: name, value: id })),
          });

          if (p.isCancel(project)) cancelOperation(p);

          const { name, token } = projects.find((item) => item.id === project)!;

          dispatchLock(token);

          sp.stop(`${name} selected ✅`);
        } else cancelOperation(p);
      } else cancelOperation(p);
    }
  }
}
