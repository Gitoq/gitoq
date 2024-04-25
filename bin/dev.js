#!/usr/bin/env node_modules/.bin/ts-node
/* eslint-disable unicorn/prefer-module , unicorn/prefer-top-level-await */
(async () => {
  const oclif = await import("@oclif/core");
  await oclif.execute({ dir: __dirname, development: true });
})();
