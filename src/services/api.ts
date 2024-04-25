import { TOptions, TOrvalOptions } from "./types";
import { configEnv, deleteConfig, getConfig } from "../helper/index";

configEnv();

const baseURL = process.env.BASE_URL as string;

type TApi<T> = Promise<{ data: T; response: Response }>;

export const api = async <T>({ data, headers, method, params, url }: TOrvalOptions, options?: TOptions): TApi<T> => {
  try {
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

    const response = await fetch(url, configs);
    const json: T = await response.json();
    if (response.ok) {
      return { response, data: json };
    } else throw json;
  } catch (error: any) {
    error?.status === 401 && deleteConfig();
    throw error;
  }
};
