import fs from "fs";
import os from "os";
import path from "path";
import boxen from "boxen";
import chalk from "chalk";
import { Hook } from "@oclif/core";
import messages from "../../messages/index.js";

type VersionType = "major" | "minor" | "patch";
type LastCacheType = { version: string; type: VersionType; time: number };

const checkLatestVersion = async (packageName: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    const data = await response.json();
    return data["dist-tags"].latest;
  } catch {
    return null;
  }
};

const getCachePath = (cliName: string) => path.join(os.homedir(), `.config/${cliName}/version-check.json`);

const shouldShowMessage = (cache: LastCacheType | null, latestVersion: string): boolean => {
  if (!cache) return true;
  if (cache.version !== latestVersion) return true;

  const now = Date.now();
  const diff = now - cache.time;
  const oneDay = 24 * 60 * 60 * 1000;
  const frequency: { [key in VersionType]: number } = { major: oneDay / 6, minor: oneDay / 4, patch: oneDay / 2 };
  return diff > frequency[cache.type];
};

const hook: Hook.Init = async function () {
  const currentVersion = this.config.version;
  const latestVersion = await checkLatestVersion(this.config.name);

  if (!latestVersion || currentVersion === latestVersion) return;

  const [curMajor, curMinor, curPatch] = currentVersion.split(".");
  const [latMajor, latMinor, latPatch] = latestVersion.split(".");

  let type: VersionType | null = null;
  let message: string | null = null;

  if (latMajor !== curMajor) {
    type = "major";
    message = "🚨 Major update available — includes big changes and possible breaking updates!";
  } else if (latMinor !== curMinor) {
    type = "minor";
    message = "✨ Minor update available — new features and improvements included.";
  } else if (latPatch !== curPatch) {
    type = "patch";
    message = "🐛 Maintenance release — bug fixes and small enhancements.";
  }

  if (!type || !message) return;

  const cachePath = getCachePath(this.config.name);

  let lastCache: LastCacheType | null = null;

  try {
    if (fs.existsSync(cachePath)) {
      const content = fs.readFileSync(cachePath, "utf-8");
      lastCache = JSON.parse(content);
      const invalidCache =
        !lastCache?.time || !lastCache?.version || !lastCache?.type || !["major", "minor", "patch"].includes(lastCache.type);
      if (invalidCache) lastCache = null;
    }
  } catch {
    lastCache = null;
  }

  if (!shouldShowMessage(lastCache, latestVersion)) return;

  const content = `${chalk.italic(message)}\n
${chalk.strikethrough.red(`v${currentVersion}`)} → ${chalk.greenBright(`v${latestVersion}`)}\n
${chalk.italic("👉 To update, run:")} ${chalk.white(`npm install -g ${this.config.name}`)}\n
${`${messages.changelog} ${chalk.cyan.underline(`${this.config.pjson.repository.url}/releases/tag/v${latestVersion}`)}`}`;

  console.log(boxen(content, { padding: 1, margin: 1, borderStyle: "round", borderColor: "gray", align: "left" }));

  lastCache = { version: latestVersion, type, time: Date.now() };
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(lastCache, null, 2));
};

export default hook;
