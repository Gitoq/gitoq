import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import * as fs from "node:fs";

import { loginServices } from "../../services/login-services.js";

export default class Login extends Command {
  static description = "Log in";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    p.intro("Welcome to dotenv CLI! 🚀");

    const data = await p.group({
      email: () => p.text({ message: "please enter your email" }),
      password: () => p.password({ message: "please enter your password" }),
    });

    const sp = p.spinner();
    sp.start("loading 🔁");

    try {
      const response = await loginServices(data);
      const envValue = `TOKEN=${response}`;
      fs.writeFile(".env.me", envValue, (error) => {
        if (error) sp.stop(error.message);
        else sp.stop("welcome 🎉");
      });
    } catch {
      sp.stop("email or password wrong !");
    }
  }
}
