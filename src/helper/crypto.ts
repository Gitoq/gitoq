import cryptoJs from "crypto-js";

export const encrypt = (content: string, key: string) => cryptoJs.AES.encrypt(content, key).toString();

export const decrypt = (content: string, key: string) => cryptoJs.AES.decrypt(content, key).toString(cryptoJs.enc.Utf8);
