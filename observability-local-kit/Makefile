.EXPORT_ALL_VARIABLES:
# the imstrumented app docker image (required when `make up`)
INSTRUMENTED_IMAGE?=
# [Apply slack web hook](https://api.slack.com/messaging/webhooks)
SLACK_WEBHOOK?=
### login for using private gcr container registery
login:
	@gcloud auth login

### For docker image application ###
up:
	@docker-compose -f docker-compose-image.yml up -d

up-build:
	@docker-compose -f docker-compose-image.yml up --build
ps:
	@docker-compose -f docker-compose-image.yml ps

down:
	@docker-compose -f docker-compose-image.yml down

restart: down up

log: ## Show logs for all or c=<name> containers
	@docker-compose -f docker-compose-image.yml logs --tail=100 -f $(c)

### For localhost application ###
local-up:
	@docker-compose -f docker-compose-local.yml up -d

local-up-build:
	@docker-compose -f docker-compose-local.yml up --build
local-ps:
	@docker-compose -f docker-compose-local.yml ps

local-down:
	@docker-compose -f docker-compose-local.yml down

local-restart: local-down local-up

local-log: ## Show logs for all or c=<name> containers
	@docker-compose -f docker-compose-local.yml logs --tail=100 -f $(c)


sh: ## Is used to see sh into containers. To sh specific container use for example if I only want to sh application container run `make sh c=nis`
	@docker exec -it $(c) sh 

# configure to send log from Docker to Loki
# https://grafana.com/docs/loki/latest/clients/docker-driver/#docker-driver-client
docker-driver:
	@docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
