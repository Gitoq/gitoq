import * as p from "@clack/prompts";
import { Command } from "@oclif/core";

// import { pullServices } from "../../services/pull-services";

export default class Pull extends Command {
  static description = "Pull .env securely";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    const kind = await p.select({
      message: "Pick a env type.",
      options: [
        { label: "development", value: "development" },
        { label: "production", value: "production" },
      ],
    });

    if (p.isCancel(kind)) {
      p.cancel("Operation cancelled. 😒");
      process.exit(0);
    }

    const sp = p.spinner();
    sp.start("loading 🔁");

    try {
      // const response = await pullServices(kind as "development" | "production");
      // fs.writeFile(`.env.${kind}`, String(response), (error) => {
      //   if (error) sp.stop(error.message);
      //   else sp.stop("success ✅");
      // });
    } catch {
      sp.stop("oops ❌");
    }
  }
}
