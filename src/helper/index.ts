import open from "open";
import fs from "node:fs";
import chalk from "chalk";
import dotenv from "dotenv";
import path from "node:path";
import * as p from "@clack/prompts";
import { createServer } from "node:http";
import messages from "../messages/index.js";
import { decrypt, encrypt } from "./crypto.js";
import { CONFIG_FILE_URL, EXAMPLE_ENV_PATHS, LOCAL_ENV_PATHS } from "../constants/index.js";

dotenv.config();

type TLockEnvParsOption = { token: string };
type TConfigFileContent = { token: string };
type TEnvStringOptions = { key: string; value?: string }[];

type TSpinner = {
  stop: (msg?: string | undefined) => void;
  start: (msg?: string | undefined) => void;
  message: (msg?: string | undefined) => void;
};
type TBrowserOptions = {
  url: string;
  port: number;
  spinner: TSpinner;
  waitingMessage: string;
  params?: string | string[][] | URLSearchParams | Record<string, string>;
};

export const NeedHelpDescription = `${messages.needHelp} ${chalk.underline(chalk.cyan(`${process.env.FRONT_BASE_URL}/docs`))}`;

export const regex = {
  removeSpace: / /g,
  version: /\d+\.\d+\.\d+/,
  envKeyValue: /^(.*?)=(.*)$/gm,
  removeEnter: /^[\n\r]+|[\n\r]+$/g,
  envRemoveDefaultContent: /#\/-+ gitoq -+\/[\S\s]*?#\/-+ .env.* -+\//,
};

// ? config file

export const isConfigExists = () => fs.existsSync(CONFIG_FILE_URL);

export const dispatchConfig = (token: string) => {
  const content: TConfigFileContent = { token };
  fs.writeFileSync(CONFIG_FILE_URL, JSON.stringify(content), { flag: "w+" });
};

export const getConfig = () => {
  if (isConfigExists()) {
    const content = fs.readFileSync(CONFIG_FILE_URL, { encoding: "utf8" });
    if (content) {
      const parsedData = JSON.parse(content) as TConfigFileContent;
      if (parsedData.token) return parsedData.token;
    }
  }
};

export const deleteConfig = () => isConfigExists() && fs.unlinkSync(CONFIG_FILE_URL);

// ? lock file
export const isLockExists = () => {
  const lockPath = path.join(process.cwd(), ".env.gitoq.lock");
  return { path: lockPath, isExists: fs.existsSync(lockPath) };
};

export const dispatchLock = (values: TEnvStringOptions) => {
  const dest = path.join(process.cwd(), ".env.gitoq.lock");
  fs.writeFileSync(dest, envStringify(values), { flag: "w+" });
};

export const deleteLock = () => {
  const { path, isExists } = isLockExists();
  isExists && fs.unlinkSync(path);
};

export const getLock = (spinner?: TSpinner): TLockEnvParsOption => {
  const { path, isExists } = isLockExists();
  if (isExists) {
    const content = fs.readFileSync(path, { encoding: "utf8" });
    return lockEnvParser(content);
  }

  cancelOperation({ spinner, message: messages.project.connect });

  return { token: "" };
};

// ? env file
export const isEnvExists = () => {
  const isExists = fs.existsSync(path.join(process.cwd(), LOCAL_ENV_PATHS));
  return { isExists, path: LOCAL_ENV_PATHS };
};

export const getEnvContent = async (spinner?: TSpinner) => {
  const { path, isExists } = isEnvExists();
  if (isExists) {
    let content = fs.readFileSync(path, { encoding: "utf8" });
    content = envTrimer(content);
    content = content.replace(regex.envRemoveDefaultContent, "");
    content = content.replace(regex.removeEnter, "");
    return await encrypt("ENV", content);
  }

  cancelOperation({ spinner, message: messages.env.notFound });
  return "";
};

export const dispatchEnvContent = async ({
  env,
  with_env_example,
}: {
  with_env_example: boolean;
  env: { name: string; content: string };
}) => {
  const { path: envPath } = isEnvExists();
  const encryptedContent = await decrypt("ENV", env.content);
  fs.writeFileSync(envPath, `${defaultEnvContent(env.name)}\n${encryptedContent}`, { flag: "w+" });

  // create .env.example
  if (with_env_example) {
    const content = generateEnvExample(encryptedContent);
    fs.writeFileSync(EXAMPLE_ENV_PATHS, `${defaultEnvContent("example")}\n${content}`, { flag: "w+" });
  }
  // if with_env_example is false and .env.example is exist
  else if (fs.existsSync(path.join(process.cwd(), EXAMPLE_ENV_PATHS))) fs.unlinkSync(EXAMPLE_ENV_PATHS);
};

export const cancelOperation = (options?: { message?: string; spinner?: TSpinner }) => {
  if (options?.spinner) options.spinner.stop(chalk.redBright(options.message ?? messages.cancel));
  else p.cancel(chalk.redBright(options?.message ?? messages.cancel));
  p.outro(NeedHelpDescription);
  process.exit(0);
};

const browserLoginHeader = {
  Connection: "close",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": process.env.FRONT_BASE_URL,
};

export const browser = async <T>({ url, port, params, spinner, waitingMessage }: TBrowserOptions) => {
  spinner.start(messages.browser.opening);

  const queue = new URLSearchParams(params);
  queue.set("port", String(port));

  const encryptQuery = new URLSearchParams();
  const encryptValue = await encrypt("CLI", queue.toString());
  encryptQuery.set("=", encryptValue);

  const href = `${process.env.FRONT_BASE_URL}${url}?${encryptQuery.toString()}`;

  const openResult = await open(href);

  return new Promise<T>((resolve, reject) => {
    openResult.on("error", () => {
      spinner.stop(`please open ${chalk.underline(chalk.gray(href))} your browser`);
    });
    openResult.on("exit", (code) => {
      if (code === 0) {
        spinner.stop(messages.browser.opened);
        spinner.start(waitingMessage);
      }
    });

    const server = createServer(async (req, res) => {
      if (req.method === "OPTIONS") {
        res.writeHead(204, browserLoginHeader);
        res.end();
        return;
      }

      if (req.url === "/callback" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            res.writeHead(200, browserLoginHeader);
            resolve(JSON.parse(body));
            res.end();
            server.close();
          } catch (error) {
            res.writeHead(400, browserLoginHeader);
            reject(error);
            res.end();
            server.close();
            cancelOperation({ spinner, message: error.message });
          }
        });
      }
    });
    server.listen(port);
  });
};

export const commandNote = ({ title, description }: { title: string; description: string[] }) => {
  const noteDescription = description.map((item, index) => `${item}         ${description.length === index + 1 ? "" : "\n"}`);
  p.note(noteDescription.join(""), chalk.bold(title));
};

export const envTrimer = (content: string) => {
  const _content = content.split("\n").map((item) => {
    regex.envKeyValue.lastIndex = 0;
    const match = regex.envKeyValue.exec(item);
    return match ? `${match[1]}=${match[2]}`.replace(regex.removeSpace, "") : item.trim();
  });
  return _content.join("\n").trim();
};

export const envStringify = (parseEnv: TEnvStringOptions) => {
  const _content = parseEnv.reduce<string>((prev, current) => {
    prev += current.key && current.value ? `${current.key}=${current.value}`.replace(regex.removeSpace, "") : current.key.trim();
    return `${prev}\n`;
  }, "");
  return _content.trim();
};

export const lockEnvParser = (content: string) => {
  const _content = content.split("\n").reduce<TLockEnvParsOption>(
    (prev, current) => {
      regex.envKeyValue.lastIndex = 0;
      const match = regex.envKeyValue.exec(current);
      if (match && ["token"].includes(match[1]))
        prev = { ...prev, [match[1].replace(regex.removeSpace, "")]: match[2].replace(regex.removeSpace, "") };
      return prev;
    },
    { token: "" },
  );
  return _content;
};

export const generateEnvExample = (content: string) => {
  const _content = content.split("\n").reduce<string>((prev, current) => {
    regex.envKeyValue.lastIndex = 0;
    const match = regex.envKeyValue.exec(current);
    prev += match ? `${match[1]}=` : current;
    return `${prev}\n`;
  }, "");
  return _content;
};

export const defaultEnvContent = (name: string) => {
  const content = `
#/------------------------ gitoq ------------------------/
# Your data's safety is our top priority!
# [learn more] (${process.env.FRONT_BASE_URL})
#/----------------- .env.${name} -------------------/
`;
  return content.replace(regex.removeEnter, "");
};

export const getVersion = () => {
  const content = fs.readFileSync(process.cwd() + "/version.txt", { encoding: "utf8" });
  const data = content.match(regex.version);
  let version = "0.0.0";
  if (data) version = data[0];
  return version;
};
