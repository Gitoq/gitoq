import open from "open";
import fs from "node:fs";
import chalk from "chalk";
import dotenv from "dotenv";
import path from "node:path";
import * as p from "@clack/prompts";
import { createServer } from "node:http";
import messages from "../messages/index.js";
import { decrypt, encrypt } from "./crypto.js";
import { CONFIG_FILE_URL } from "../constants/index.js";

dotenv.config();

type TConfigFileContent = { token: string };
type TEnvParsOption = { token: string };
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

export const regex = {
  envKeyValue: /^(.*?)=(.*)$/gm,
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

export const getLock = (spinner?: TSpinner): TEnvParsOption => {
  const { path, isExists } = isLockExists();
  if (isExists) {
    const content = fs.readFileSync(path, { encoding: "utf8" });
    return envParser(content);
  }

  cancelOperation({ spinner, message: messages.project.connect });

  return { token: "" };
};

// ? env file
export const isEnvExists = () => {
  const envPaths = [".env.local"];
  const foundPath = envPaths.find((pathname) => fs.existsSync(path.join(process.cwd(), pathname)));
  return { isExists: Boolean(foundPath), path: foundPath ?? envPaths[0] };
};

export const getEnvContent = async (spinner?: TSpinner) => {
  const { path, isExists } = isEnvExists();
  if (isExists) {
    let content = fs.readFileSync(path, { encoding: "utf8" });
    content = content.replace(regex.envRemoveDefaultContent, "");
    return await encrypt("ENV", content);
  }

  cancelOperation({ spinner, message: messages.env.notFound });
  return "";
};

export const dispatchEnvContent = async (content: string, name: string) => {
  const { path } = isEnvExists();
  const encryptedContent = await decrypt("ENV", content);

  fs.writeFileSync(path, `${defaultEnvContent(name)}${encryptedContent}`, { flag: "w+" });
};

export const cancelOperation = (options?: { message?: string; spinner?: TSpinner }) => {
  if (options?.spinner) options.spinner.stop(chalk.redBright(options.message ?? messages.cancel));
  else p.cancel(chalk.redBright(options?.message ?? messages.cancel));
  p.outro(`${messages.needHelp} ${chalk.underline(chalk.cyan(`${process.env.FRONT_BASE_URL}/docs`))}`);
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
    }).listen(port);
  });
};

export const commandNote = ({ title, description }: { title: string; description: string[] }) => {
  const noteDescription = description.map((item, index) => `${item}         ${description.length === index + 1 ? "" : "\n"}`);
  p.note(noteDescription.join(""), chalk.bold(title));
};

export const trimerEnv = (content: string) =>
  content
    .split("\n")
    .map((item) => {
      regex.envKeyValue.lastIndex = 0;
      const match = regex.envKeyValue.exec(item);
      return match ? `${match[1].trim()}=${match[2].trim()}` : item.trim();
    })
    .join("\n");

export const envStringify = (parseEnv: TEnvStringOptions) =>
  parseEnv.reduce<string>((prev, current) => {
    prev += current.key && current.value ? `${current.key}=${current.value}` : current.key;
    return `${prev}\n`;
  }, "");

export const envParser = (content: string) =>
  content.split("\n").reduce<TEnvParsOption>(
    (prev, current) => {
      regex.envKeyValue.lastIndex = 0;
      const match = regex.envKeyValue.exec(current);
      if (match && ["token"].includes(match[1])) prev = { ...prev, [match[1]]: match[2] };
      return prev;
    },
    { token: "" },
  );

export const defaultEnvContent = (name: string) => {
  const content = `
#/------------------------ gitoq ------------------------/
# Your data's safety is our top priority!         
# [learn more] (${process.env.FRONT_BASE_URL})   
#/----------------- .env.${name} -------------------/`;
  return content.replace(/^\n|\n$/g, "");
};
