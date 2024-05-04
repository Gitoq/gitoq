`gitoq` is a cli to share env files with high security in minimum time between environments and team members.

[![NPM Version](https://img.shields.io/npm/v/gitoq.svg?style=flat-square)](https://npmjs.org/package/gitoq)

## 🌱 Install

It works with a single command:

```sh
npx gitoq
```

## 🚀 Quick start

Start the process of synchronizing, managing and deploying your passwords using the Quick Start Guide:

```sh
gitoq login
```

That's it. now you need to connect your project. run the connect command:

```sh
gitoq connect
```

Nice! You can use the following command to synchronize this env:

```sh
gitoq pull
```

```sh
gitoq push
```

After connecting the project we will create an `env.gitoq.lock` file to track the project. you can
commit and push your `env.gitoq.lock` file safely to a version controller like git.

---

## 🏗️ Usage

⭐ Note: Our intention regarding the file `ENV` is the file `.env` or `.env.local`. We will create one of them for you based on their presence in your source code (priority is given to `.env`).

Now you can get the latest changes of your main env (by default `development`):

```bash
gitoq pull
```

If you don't have the env.local file, we'll create it for you and monitor your changes. Be careful, if it already exists, we'll change its content. (You can change it before running this command to send your env.local first)

When you make a change to your `ENV` file, push it up:

```sh
gitoq push
```

## 👽 Manage Multiple Environments

After you've pushed your `ENV` file, gitoq automatically sets up your main env. Manage multiple environments with the included UI. [learn more](https://www.gitoq.com)

```sh
gitoq pull -l
```

That's it! Manage your ci, staging, and production secrets from there.

Would you also like to pull your production `.env` to your machine? Run the command:

```sh
gitoq pull -l
```

<a href="https://www.gitoq.com/docs">Learn more about usage</a>

## 📖 Commands

```sh
gitoq --help
```

- [login](#login)
- [logout](#logout)
- [connect](#connect)
- [disconnect](#disconnect)
- [push](#push)
- [pull](#pull)

### `login`

login your gitoq account.

Example:

```sh
gitoq login
```

---

### `logout`

logout your gitoq account.

Example:

```sh
gitoq logout
```

---

### `connect`

Connect your project to your local workspace.

Example:

```sh
gitoq connect
```

##### ARGUMENTS

_[Token]_

Connect your project directly to your local workspace.

```sh
gitoq connect PROJECT_TOKEN
```

---

### `disconnect`

cancel access to the project from the local workspace.

Example:

```sh
gitoq disconnect
```

---

### `push`

Set changes of local workspace to env.

Example:

```sh
gitoq push
```

##### FLAGS

_-l, --list_

Set local workspace changes to preferred env.

```sh
gitoq push -l
```

---

### `pull`

Get changes of env to local workspace.

Example:

```sh
gitoq pull
```

##### FLAGS

_-l, --list_

Get desired env changes to the local workspace.

```sh
gitoq pull -l
```

---

## ❓ FAQ

### What is my main environment?

It is `development` by default, but you can change it in the project settings.

### What does `ENV` mean?

Our intention regarding the file `ENV` is the file `.env` or` .env.local` . We will create one of them for you based on their presence in your source code (priority is given to `.env`).

### Should I commit my `ENV` files?

No. We strongly recommend against committing your env files to version control. It should only include environment-specific values such as database passwords or API keys. Your production database should have a different password than your development database.

### Should I commit my `env.gitoq.lock` file?

Yes sure. It is safe and recommended to do so. It your project identifier.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## License

MIT
