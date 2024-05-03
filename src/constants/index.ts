import os from "node:os";
import path from "node:path";

export const LOCAL_ENV_PATHS = [".env", ".env.local"];

export const EXAMPLE_ENV_PATH = ".env.example";

export const CONFIG_FILE_URL = path.join(os.homedir(), "gitoq.auth.json");
