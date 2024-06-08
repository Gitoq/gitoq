import { TOptions, TOrvalOptions } from "./types.js";
import { BACK_BASE_URL } from "../constants/index.js";
import { deleteConfig, getConfig } from "../helper/index.js";

type TApi<T> = Promise<{ data: T; response: Response }>;

export const api = async <T>({ url, data, method, params, headers }: TOrvalOptions, options?: TOptions): TApi<T> => {
  try {
    url = BACK_BASE_URL + url;
    if (params) url += "?" + new URLSearchParams(params);

    const authorization = (options?.headers as any)?.authorization || getConfig();

    const configs: RequestInit = {
      method,
      body: JSON.stringify(data),
      ...options,
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
    }

    throw json;
  } catch (error: any) {
    const status = error?.status;
    if (status && [401, 423].includes(status)) deleteConfig();
    throw error;
  }
};
