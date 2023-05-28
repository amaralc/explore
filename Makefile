# Persistence
setup:
	cp .env.example .env \
	&& docker-compose -f docker-compose.yml up -d && echo 'Finish setting up containers...' && sleep 2

cleanup:
	docker-compose -f docker-compose.yml down

prune:
	docker-compose -f docker-compose.yml down -v

# Docker
config:
	docker-compose -f docker-compose.yml config

researchers-peers-svc-docker-build:
#	sudo docker build -t researchers-peers-svc:latest --build-arg SSH_PRIVATE_KEY="$$(cat ~/.ssh/id_rsa)" --no-cache .
	sudo docker build -t researchers-peers-svc:latest -f apps/researchers/peers/svc/Dockerfile .

researchers-peers-svc-docker-build-no-cache:
#	sudo docker build -t researchers-peers-svc:latest --build-arg SSH_PRIVATE_KEY="$$(cat ~/.ssh/id_rsa)" --no-cache .
	sudo docker build -t researchers-peers-svc:latest -f apps/researchers/peers/svc/Dockerfile --no-cache .

researchers-peers-svc-rest-api-docker-run:
	docker run -it --rm -p 8080:8080 researchers-peers-svc:latest bash apps/researchers/peers/svc/rest-api/run-build.sh

researchers-peers-svc-consumer-docker-run:
	docker run -it --rm -p 8080:8080 researchers-peers-svc:latest bash apps/researchers/peers/svc/consumer/run-build.sh

# Application
researchers-peers-svc-prisma-postgresql-setup:
	yarn prisma generate --schema libs/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma

researchers-peers-svc-rest-api-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example apps/researchers/peers/svc-rest-api/.env && make researchers-peers-svc-prisma-postgresql-setup && yarn nx serve researchers-peers-svc-rest-api

researchers-peers-svc-consumer-with-api-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve consumer-with-api

researchers-peers-svc-consumer-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve service-consumer

terraform-init-staging:
	cd apps/core/platform/iac-shell/staging && terraform init -upgrade

terraform-plan-staging:
	cd apps/core/platform/iac-shell/staging && terraform plan -var-file=env.tfvars

terraform-apply-staging:
	cd apps/core/platform/iac-shell/staging && terraform apply -var-file=env.tfvars

terraform-apply-staging-auto-approve:
	cd apps/core/platform/iac-shell/staging && terraform apply -var-file=env.tfvars -auto-approve

terraform-plan-staging-out:
	cd apps/core/platform/iac-shell/staging && terraform plan -var-file=env.tfvars -out=tfplan

terraform-destroy-staging:
	cd apps/core/platform/iac-shell/staging && terraform destroy -var-file=env.tfvars
