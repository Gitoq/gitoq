import os from "node:os";
import path from "node:path";

// ? dev
// export const FRONT_BASE_URL = "http://localhost:3000";
// export const BACK_BASE_URL = "http://localhost:4000/api";

// ? prod
export const FRONT_BASE_URL = "https://gitoq.com";
export const BACK_BASE_URL = "https://api.gitoq.com/api";

export const LOCAL_ENV_PATHS = [".env", ".env.local"];

export const EXAMPLE_ENV_PATH = ".env.example";

export const CONFIG_FILE_URL = path.join(os.homedir(), "gitoq.auth.json");
