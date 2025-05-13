import fs from "fs";
import os from "os";
import path from "path";
import boxen from "boxen";
import chalk from "chalk";
import { Hook } from "@oclif/core";
import { NeedHelpDescription } from "../../helper/index.js";

const checkLatestVersion = async (name: string): Promise<string> => {
  const response = await fetch(`https://registry.npmjs.org/${name}`);
  const data = await response.json();
  return data["dist-tags"].latest;
};

const getCachePath = (cliName: string) => path.join(os.homedir(), `.config/${cliName}/version-check.json`);

const shouldShowMessage = (type: "major" | "minor" | "patch", lastCheck: number): boolean => {
  const now = Date.now();
  const diff = now - lastCheck;
  const oneDay = 24 * 60 * 60 * 1000;
  const frequency = { major: oneDay / 6, minor: oneDay / 4, patch: oneDay / 2 };
  return diff > frequency[type];
};

const hook: Hook.Init = async function () {
  const currentVersion = this.config.version;
  const latestVersion = await checkLatestVersion(this.config.name);

  if (currentVersion === latestVersion) return;

  const [curMajor, curMinor, curPatch] = currentVersion.split(".").map(Number);
  const [latMajor, latMinor, latPatch] = latestVersion.split(".").map(Number);

  let type: "major" | "minor" | "patch" | null = null;
  let message = "";

  if (latMajor > curMajor) {
    type = "major";
    message = "🚨 Major update available — includes big changes and possible breaking updates!";
  } else if (latMinor > curMinor) {
    type = "minor";
    message = "✨ Minor update available — new features and improvements included.";
  } else if (latPatch > curPatch) {
    type = "patch";
    message = "🐛 Maintenance release — bug fixes and small enhancements.";
  }

  if (!type || !message) return;

  const cachePath = getCachePath(this.config.name);

  let lastChecks: Record<string, number> = {};

  try {
    if (fs.existsSync(cachePath)) {
      const content = fs.readFileSync(cachePath, "utf-8");
      lastChecks = JSON.parse(content);
    }
  } catch {}

  if (!shouldShowMessage(type, lastChecks[type] || 0)) return;

  const content = `${chalk.italic(message)}\n
${chalk.strikethrough.red(`v${currentVersion}`)} → ${chalk.greenBright(`v${latestVersion}`)}\n
${chalk.italic("👉 To update, run:")} ${chalk.white(`npm install -g ${this.config.name}`)}\n
${NeedHelpDescription}`;

  console.log(boxen(content, { padding: 1, margin: 1, borderStyle: "round", borderColor: "gray", align: "left" }));

  lastChecks[type] = Date.now();
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(lastChecks, null, 2));
};

export default hook;
