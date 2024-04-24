import * as p from "@clack/prompts";
import { Command } from "@oclif/core";
import { dispatchConfig } from "../../helper/index";
import { apiCliLogin } from "../../services/index";

const authorization =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkIjoxfSwiaWF0IjoxNzEzODYyMDU3LCJleHAiOjE3MTY0NTQwNTd9.1QPfvxz-mORF8tVv-wG-FfK_VkR98vvNWfYDHqgNHT4";

export default class Login extends Command {
  static description = "Log in";

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
      .catch(() => sp.stop("Wrong credentials"));
  }
}
