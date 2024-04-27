export type TMethod = "GET" | "PUT" | "POST" | "PATCH" | "DELETE";

export type TOrvalOptions = {
  data?: any;
  url: string;
  method: TMethod;
  headers?: RequestInit["headers"];
  params?: string | string[][] | URLSearchParams | Record<string, string>;
};

export type TOptions = Omit<RequestInit, "url" | "body" | "method" | "credentials">;
