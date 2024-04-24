import { TOptions, TOrvalOptions } from "./types.js";
import { configEnv, deleteConfig, getConfig } from "../helper/index.js";

configEnv();

const baseURL = process.env.BASE_URL as string;

type TApi<T> = Promise<{ data: T; response: Response }>;

export const api = async <T>({ data, headers, method, params, url }: TOrvalOptions, options?: TOptions): TApi<T> => {
  url = baseURL + url;
  if (params) url += "?" + new URLSearchParams(params);

  const authorization = (options?.headers as any)?.authorization || getConfig();

  const configs: RequestInit = {
    method,
    body: JSON.stringify(data),
    ...(options ?? {}),
    headers: {
      ...headers,
      "Accept-Language": "en",
      ...(authorization ? { authorization } : {}),
      ...(options ? options.headers : {}),
    },
  };

  try {
    const response = await fetch(url, configs);
    if (response.ok) {
      const data: T = await response.json();
      return { response, data };
    } else throw response;
  } catch (error: any) {
    error?.response?.status === 401 && deleteConfig();
    throw error;
  }
};
