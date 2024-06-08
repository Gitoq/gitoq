import open from "open";
import fs from "node:fs";
import chalk from "chalk";
import path from "node:path";
import * as p from "@clack/prompts";
import { createServer } from "node:http";
import messages from "../messages/index.js";
import { decrypt, encrypt } from "./crypto.js";
import { apiCliExchangeEncryptionKey } from "../services/index.js";
import { CONFIG_FILE_URL, EXAMPLE_ENV_PATH, FRONT_BASE_URL, LOCAL_ENV_PATHS } from "../constants/index.js";

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
};

export const NeedHelpDescription = `${messages.needHelp} ${chalk.underline(chalk.cyan(`${FRONT_BASE_URL}/docs`))}`;

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
  const isExists = LOCAL_ENV_PATHS.find((item) => fs.existsSync(path.join(process.cwd(), item)));
  return { isExists: Boolean(isExists), path: isExists ?? LOCAL_ENV_PATHS[0] };
};

export const getEnvContent = async ({ env, token, spinner }: { env: string; token: string; spinner?: TSpinner }) => {
  const { path, isExists } = isEnvExists();
  if (isExists) {
    let content = fs.readFileSync(path, { encoding: "utf8" });
    content = envTrimer(content);
    content = content.replace(regex.envRemoveDefaultContent, "");
    content = content.replace(regex.removeEnter, "");

    const key = await apiCliExchangeEncryptionKey("PUSH", token, env)
      .then(({ data }) => data.key)
      .catch((error) => cancelOperation({ spinner, message: error.message }));

    return { path, content: await encrypt(content, key) };
  }

  cancelOperation({ spinner, message: messages.env.notFound });
  return { path, content: "" };
};

type TDispatchEnvContent = { key: string; with_env_example: boolean; env: { name: string; content: string } };
export const dispatchEnvContent = async ({ key, env, with_env_example }: TDispatchEnvContent) => {
  const { path: envPath } = isEnvExists();
  const encryptedContent = await decrypt(env.content, key);
  fs.writeFileSync(envPath, `${defaultEnvContent(env.name)}\n${encryptedContent}`, { flag: "w+" });

  // create .env.example
  if (with_env_example) {
    const content = generateEnvExample(encryptedContent);
    fs.writeFileSync(EXAMPLE_ENV_PATH, `${defaultEnvContent("example")}\n${content}`, { flag: "w+" });
  }
  // if with_env_example is false and .env.example is exist
  else if (fs.existsSync(path.join(process.cwd(), EXAMPLE_ENV_PATH))) fs.unlinkSync(EXAMPLE_ENV_PATH);
  return envPath;
};

export const cancelOperation = (options?: { message?: string; spinner?: TSpinner }) => {
  if (options?.spinner) options.spinner.stop(chalk.redBright(options.message ?? messages.cancel));
  else p.cancel(chalk.redBright(options?.message ?? messages.cancel));
  p.outro(NeedHelpDescription);
  process.exit(0);
};

const stringToHex = (str: string) => {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16);
  }

  return hex;
};

const browserLoginHeader = {
  Connection: "close",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": FRONT_BASE_URL,
};

export const browser = async <T>({ url, port, spinner, waitingMessage }: TBrowserOptions) => {
  spinner.start(messages.browser.opening);

  const searchparams = new URLSearchParams();
  const callback = stringToHex(`http://localhost:${port}/callback`);
  searchparams.set("callback", callback);

  const href = `${FRONT_BASE_URL}${url}?${searchparams.toString()}`;

  const openResult = await open(href);

  return new Promise<T>((resolve, reject) => {
    openResult.on("error", () => {
      spinner.stop(`please open ${chalk.underline(chalk.gray(href))} in your browser`);
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

      res.writeHead(301, { location: FRONT_BASE_URL });
      const url = new URL((FRONT_BASE_URL as string) + req.url);

      if (url.pathname === "/callback/" && req.method === "GET") {
        const token = url.searchParams.get("token");
        if (token) {
          resolve({ token } as T);
          res.end();
          server.close();
        } else {
          reject(new Error(messages.globalError));
          res.end();
          server.close();
          cancelOperation({ spinner, message: messages.globalError });
        }
      } else {
        reject(new Error(messages.globalError));
        res.end();
        server.close();
        cancelOperation({ spinner, message: messages.globalError });
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
# [learn more] (${FRONT_BASE_URL})
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

export const replaceMessage = (message: string, replacements: { key: string; value: string }[]): string =>
  replacements.reduce<string>((prev, { key, value }) => prev.replace(`{${key}}`, value), message);
