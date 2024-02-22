export const loginServices = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "soheil@gmail.com" && password === "123456789") {
        const token = `token${Math.round(Math.random() * 10)}`;
        resolve(token);
      } else reject();
    }, 1500);
  });
