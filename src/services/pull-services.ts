export const pullServices = (kind: "development" | "production") =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const productionValue = "KEY_APP=PROD";
      const developmentValue = "KEY_APP=DEV";
      if (kind === "development") resolve(developmentValue);
      else if (kind === "production") resolve(productionValue);
      else reject();
    }, 1500);
  });
