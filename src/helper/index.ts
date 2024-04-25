import fs from "node:fs";
import dotenv from "dotenv";
import path from "node:path";
import { CONFIG_FILE_URL } from "../constants/index";

export const configEnv = () => dotenv.config();

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
  throw new Error("Please login first");
};

export const deleteConfig = () => isConfigExists() && fs.unlinkSync(CONFIG_FILE_URL);

// ? lock file
export const isLockExists = () => {
  const lockPath = path.join(process.cwd(), ".gitoq.lock");
  return { isExists: fs.existsSync(lockPath), path: lockPath };
};

export const dispatchLock = (token: string) => {
  const dest = path.join(process.cwd(), ".gitoq.lock");
  fs.writeFileSync(dest, JSON.stringify({ token }), { flag: "w+" });
};

export const deleteLock = () => {
  const { path, isExists } = isLockExists();
  isExists && fs.unlinkSync(path);
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
