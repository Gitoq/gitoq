import os from "node:os";
import path from "node:path";

export const CONFIG_FILE_URL = path.join(os.homedir(), "gitoq.auth.json");

export const LOCAL_ENV_PATHS = [".env.test"];
