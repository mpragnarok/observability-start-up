# local observability playground 

This repository contains the environment for completing the tutorials at [grafana.com/tutorials](https://grafana.com/tutorials).

## Prerequisites

You will need to have the following installed locally to complete this workshop:

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [gcloud](https://cloud.google.com/sdk/docs/install): If you want to using private docker image from gcr container registry
If you're running Docker for Desktop for macOS or Windows, Docker Compose is already included in your installation.

## Running

To start the application and the supporting services:

```zsh
# Start
make up
# Down
make down
# Restart
make restart
```

If you want to run with localhost application use commands below:
```zsh
# Start
make local-up
# Down
make local-down
# Restart
make local-restart
```


## Logs

```zsh
# All app tiers
make log
# specific app, here `app` represent NIS docker container
make log c=app
```

For localhost one

```zsh
# Grafana dashboard image
make log c=grafana
```

## sh into container

```zsh
# docker container name
make sh c=nis
```

## Application

You can run the application in `node-prom-metric`

OR

Replace the instrumented app with any you need, even the localhost one, e.g., Node.js with [prom-client](https://github.com/siimon/prom-client)

## Grafana dashboard

login with
```
username: admin
password: admin
```