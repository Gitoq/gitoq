import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import { apiCliLogin } from "../../services/index.js";
import { dispatchConfig, errorHandler } from "../../helper/index.js";

const authorization =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkIjoxfSwiaWF0IjoxNzEzOTc0NzY3LCJleHAiOjE3MTY1NjY3Njd9.m1GDfnc2TnfkRMF92D0LdsLheGmIjhCFuxIujzwvh6o";

export default class Login extends Command {
  static description = "Login";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  async run(): Promise<void> {
    p.intro("Welcome to Gitoq CLI! 🚀");
    const sp = p.spinner();
    sp.start("loading 🔁");

    await apiCliLogin({ headers: { authorization } })
      .then(({ data }) => {
        dispatchConfig(data.token);
        sp.stop("welcome 🎉");
      })
      .catch(errorHandler(sp));
  }
}
