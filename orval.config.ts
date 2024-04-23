import { defineConfig } from "orval";

const toCamelCase = (string: string) => string.replace(/(?:^|\s+)(\w)/g, (match, group) => group.toUpperCase());

export default defineConfig({
  api: {
    input: {
      filters: { tags: ["cli"] },
      target: "http://127.0.0.1:3658/export/openapi?projectId=467154&version=3.0",
    },
    output: {
      tslint: true,
      mode: "single",
      client: "axios-functions",
      target: "./src/services/index.ts",
      override: {
        mutator: { path: "./src/services/api.ts", name: "api" },
        operationName: (operation, route, verb) => {
          const tag = operation?.tags?.[0]
            .split("/")
            .map((item) => toCamelCase(item))
            .join("");
          const summary = operation.summary;
          const title = tag + " " + summary;
          return `api${toCamelCase(title)}`;
        },
      },
    },
  },
});
