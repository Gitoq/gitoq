import open from "open";
import fs from "node:fs";
import dotenv from "dotenv";
import path from "node:path";
import * as p from "@clack/prompts";
import { createServer } from "node:http";
import messages from "../messages/index.js";
import { decrypt, encrypt } from "./crypto.js";
import { CONFIG_FILE_URL } from "../constants/index.js";

dotenv.config();

// ? config file
type TJsonFileContent = { token: string };

export const isConfigExists = () => fs.existsSync(CONFIG_FILE_URL);

export const dispatchConfig = (token: string) => {
  const content: TJsonFileContent = { token };
  fs.writeFileSync(CONFIG_FILE_URL, JSON.stringify(content), { flag: "w+" });
};

export const getConfig = () => {
  if (isConfigExists()) {
    const content = fs.readFileSync(CONFIG_FILE_URL, { encoding: "utf8" });
    if (content) {
      const parsedData = JSON.parse(content) as TJsonFileContent;
      if (parsedData.token) return parsedData.token;
    }
  }

  p.cancel(messages.authError);
  return "";
};

export const deleteConfig = () => isConfigExists() && fs.unlinkSync(CONFIG_FILE_URL);

// ? lock file
export const isLockExists = () => {
  const lockPath = path.join(process.cwd(), ".gitoq.lock");
  return { path: lockPath, isExists: fs.existsSync(lockPath) };
};

export const dispatchLock = (token: string) => {
  const dest = path.join(process.cwd(), ".gitoq.lock");
  fs.writeFileSync(dest, JSON.stringify({ token }), { flag: "w+" });
};

export const deleteLock = () => {
  const { path, isExists } = isLockExists();
  isExists && fs.unlinkSync(path);
};

export const getLock = () => {
  const { path, isExists } = isLockExists();
  if (isExists) {
    const content = fs.readFileSync(path, { encoding: "utf8" });
    if (content) {
      const parsedData = JSON.parse(content) as TJsonFileContent;
      if (parsedData.token) return parsedData.token;
    }
  }

  p.cancel(messages.connectProject);
  return "";
};

// ? env file
export const isEnvExists = () => {
  const envPaths = [".env.test"];
  const foundPath = envPaths.find((pathname) => fs.existsSync(path.join(process.cwd(), pathname)));
  return { isExists: Boolean(foundPath), path: foundPath ?? envPaths[0] };
};

export const getEnvContent = async () => {
  const { path, isExists } = isEnvExists();
  if (isExists) {
    const content = fs.readFileSync(path, { encoding: "utf8" });
    return await encrypt("ENV", content);
  }

  p.cancel(messages.envNotFound);
  return "";
};

export const dispatchEnvContent = async (content: string) => {
  const { path } = isEnvExists();
  const encryptedContent = await decrypt("ENV", content);
  fs.writeFileSync(path, encryptedContent, { flag: "w+" });
};

// ? error handler
type TSp = {
  stop: (msg?: string | undefined) => void;
  start: (msg?: string | undefined) => void;
  message: (msg?: string | undefined) => void;
};

export const errorHandler = (sp: TSp) => (error: any) => sp.stop(error.message ?? "fetch failed !");

export const cancelOperation = (p: any, message?: string) => {
  p.cancel(message ?? "Operation cancelled. 😒");
  process.exit(0);
};

const browserLoginHeader = {
  Connection: "close",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": process.env.FRONT_BASE_URL,
};

export const browser = async <T>({ sp, url, port }: { sp: TSp; url: string; port: number }) => {
  const cp = await open(url);

  return new Promise<T>((resolve, reject) => {
    cp.on("error", async (err) => {
      reject(err);
    });

    cp.on("exit", (code) => {
      if (code === 0) {
        sp.stop("Browser opened");

        sp.start("Waiting for login");
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
            errorHandler(sp)(error);
            res.end();
            server.close();
          }
        });
      }
    }).listen(port);
  });
};
