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
	sudo docker build -t researchers-peers-svc:latest -f teams/researchers/peers/svc-rest-api/Dockerfile .

researchers-peers-svc-docker-build-no-cache:
#	sudo docker build -t researchers-peers-svc:latest --build-arg SSH_PRIVATE_KEY="$$(cat ~/.ssh/id_rsa)" --no-cache .
	sudo docker build -t researchers-peers-svc:latest -f teams/researchers/peers/svc-rest-api/Dockerfile --no-cache .

researchers-peers-svc-rest-api-docker-run:
	docker run -it --rm -p 8080:8080 researchers-peers-svc:latest bash teams/researchers/peers/svc/rest-api/run-build.sh

researchers-peers-svc-consumer-docker-run:
	docker run -it --rm -p 8080:8080 researchers-peers-svc:latest bash teams/researchers/peers/svc/consumer/run-build.sh

# Application
researchers-peers-svc-prisma-postgresql-setup:
	yarn prisma generate --schema teams/people/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma

researchers-peers-svc-rest-api-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example teams/researchers/peers/svc-rest-api/.env && make researchers-peers-svc-prisma-postgresql-setup && yarn nx serve researchers-peers-svc-rest-api

researchers-peers-svc-consumer-with-api-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve consumer-with-api

researchers-peers-svc-consumer-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve service-consumer

terraform-init-staging:
	cd teams/core/platform-shell-iac/staging && terraform init -upgrade

terraform-plan-staging:
	cd teams/core/platform-shell-iac/staging && terraform plan -var-file=env.tfvars

terraform-apply-staging:
	cd teams/core/platform-shell-iac/staging && terraform apply -var-file=env.tfvars

terraform-apply-staging-auto-approve:
	cd teams/core/platform-shell-iac/staging && terraform apply -var-file=env.tfvars -auto-approve

terraform-plan-staging-out:
	cd teams/core/platform-shell-iac/staging && terraform plan -var-file=env.tfvars -out=tfplan

terraform-destroy-staging:
	cd teams/core/platform-shell-iac/staging && terraform destroy -var-file=env.tfvars

kong-postgres:
	COMPOSE_PROFILES=database KONG_DATABASE=postgres docker compose -f teams/kernel/api-gateway/docker-compose-kong.yml up -d

kong-dbless:
	docker compose -f teams/kernel/api-gateway/docker-compose-kong.yml up -d 

clean:
	docker compose -f teams/kernel/api-gateway/docker-compose-kong.yml down -v

# IAM Service (Logto on Kubernetes via Terraform)
# Two-phase apply: Crossplane must be installed first so its CRDs exist
# before Terraform can plan resources that reference them (XRD, Composition, etc.)
iam-local-setup:
	minikube status --profile peerlab-iam >/dev/null 2>&1 || \
		minikube start --profile peerlab-iam --driver=docker --memory=4096 --cpus=2
	minikube addons enable ingress --profile peerlab-iam
	cd teams/kernel/shell-iac/local && terraform init
	cd teams/kernel/shell-iac/local && terraform apply -auto-approve -target='module.environment.module.local_platform[0]'
	cd teams/kernel/shell-iac/local && terraform apply -auto-approve
	@echo ""
	@echo "============================================================"
	@echo "Logto IAM stack is ready!"
	@echo "Run 'make iam-local-tunnel' in a separate terminal to access"
	@echo "  Admin: https://logto-admin.localhost"
	@echo "  App:   https://logto.localhost"
	@echo "============================================================"

iam-local-tunnel:
	minikube tunnel --profile peerlab-iam

iam-local-teardown:
	cd teams/kernel/shell-iac/local && terraform destroy -auto-approve