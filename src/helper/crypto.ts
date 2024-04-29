import dotenv from "dotenv";
import cryptoJs from "crypto-js";

dotenv.config();

type TKey = "ENV" | "CLI";

export const encrypt = async (key: TKey, content: string) =>
  await cryptoJs.AES.encrypt(
    content,
    key === "CLI" ? String(process.env.CLI_SYNC_SALT) : String(process.env.ENV_SYNC_SALT),
  ).toString();

export const decrypt = async (key: TKey, content: string) =>
  await cryptoJs.AES.decrypt(
    content,
    key === "CLI" ? String(process.env.CLI_SYNC_SALT) : String(process.env.ENV_SYNC_SALT),
  ).toString(cryptoJs.enc.Utf8);
