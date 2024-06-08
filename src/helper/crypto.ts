import cryptoJs from "crypto-js";

export const encrypt = async (content: string, key: string) => await cryptoJs.AES.encrypt(content, key).toString();

export const decrypt = async (content: string, key: string) =>
  await cryptoJs.AES.decrypt(content, key).toString(cryptoJs.enc.Utf8);
