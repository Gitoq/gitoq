export const pushServices = (kind: "development" | "production") =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const productionValue = ".env.production";
      const developmentValue = ".env.development";
      if (kind === "development") resolve(developmentValue);
      else if (kind === "production") resolve(productionValue);
      else reject();
    }, 1500);
  });
