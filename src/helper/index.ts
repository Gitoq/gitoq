import dotenv from "dotenv";
import fs from "node:fs";
import { CONFIG_FILE_URL } from "../constants/index.js";

// ? env
export const configEnv = () => dotenv.config();

// ? config file
type TJsonFileContent = { token: string };

export const dispatchConfig = (token: string) => {
  const content: TJsonFileContent = { token };
  fs.writeFileSync(CONFIG_FILE_URL, JSON.stringify(content), { flag: "a" });
};

export const getConfig = () => {
  const content = fs.readFileSync(CONFIG_FILE_URL, { encoding: "utf8" });
  if (content) {
    const parsedData = JSON.parse(content) as TJsonFileContent;
    if (parsedData.token) return parsedData.token;
  }
  throw new Error("Please login first");
};

export const deleteConfig = () => {
  const isExists = fs.existsSync(CONFIG_FILE_URL);
  isExists && fs.unlinkSync(CONFIG_FILE_URL);
};
