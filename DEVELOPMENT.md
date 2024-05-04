# Development README

Fork and clone the repo. Use `./bin/dev` to run local development commands.

```sh
./bin/dev login
./bin/dev push
./bin/dev pull
# etc
```

Note that gitoq uses [oclif](https://oclif.io/).

## Enable automatic version increase

Navigate to the root directory of your project where the setup.sh script is located. Then execute command `./setup.sh` inside `git bash`.

## Testing

```sh
pnpm test
```

## Publishing

Only for those with permission.

```sh
pnpm publish
```
