export type TMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type TOrvalOptions = {
  data?: any;
  headers?: RequestInit["headers"];
  method: TMethod;
  params?: Record<string, string> | URLSearchParams | string | string[][];
  url: string;
};

export type TOptions = Omit<RequestInit, "body" | "credentials" | "method" | "url">;
