import * as p from "@clack/prompts";
import { Command } from "@oclif/core";

// import { pushServices } from "../../services/push-services";

export default class Push extends Command {
  static description = "Push .env securely";

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
      // const response = await pushServices(kind as "development" | "production");
      // fs.readFile(String(response), (error, data) => {
      //   if (error) sp.stop(error.message);
      //   else {
      //     const value = data.toString();
      //     p.outro(value);
      //     sp.stop("success ✅");
      //   }
      // });
    } catch {
      sp.stop("oops ❌");
    }
  }
}
