# Persistence
persistence-setup-postgresql:
	cp .env.example .env \
	&& cp .env.example ./apps/_persistence/.env \
	&& cd apps/_persistence && docker-compose -f docker-compose-postgresql.yml up -d && echo 'Finish setting up containers...' && sleep 2

persistence-cleanup-postgresql:
	cd apps/_persistence && docker-compose -f docker-compose-postgresql.yml down

persistence-prune-postgresql:
	cd apps/_persistence && docker-compose -f docker-compose-postgresql.yml down -v

persistence-setup-mongodb:
	cp .env.example .env \
	&& cp .env.example ./apps/_persistence/.env \
	&& cd apps/_persistence && docker-compose -f docker-compose-mongodb.yml up -d && echo 'Finish setting up containers...' && sleep 2

persistence-cleanup-mongodb:
	cd apps/_persistence && docker-compose -f docker-compose-mongodb.yml down

persistence-prune-mongodb:
	cd apps/_persistence && docker-compose -f docker-compose-mongodb.yml down -v

# Hasura (Dev Tool)
hasura-console:
	cd apps/_persistence && cp .env ./hasura/.env && cd hasura && hasura console --envfile .env

hasura-setup:
	echo 'Setting up Hasura...' \
	&& cd apps/_persistence && cp .env ./hasura/.env \
	&& cd hasura \
	&& hasura metadata apply --envfile .env \
	&& hasura migrate apply --envfile .env \
	&& hasura metadata reload --envfile .env

# Infra
infra-setup:
	make persistence-setup && make hasura-setup

# Docker

sudo-docker-image-build-rest-api:
#	sudo docker build -t micro-applications-template:latest --build-arg SSH_PEM_PRIVATE_KEY="$$(cat ~/.ssh/id_rsa)" --no-cache .
	sudo docker build -t micro-applications-template:latest -f apps/service-rest-api/Dockerfile .

sudo-docker-image-build-rest-api-no-cache:
#	sudo docker build -t micro-applications-template:latest --build-arg SSH_PEM_PRIVATE_KEY="$$(cat ~/.ssh/id_rsa)" --no-cache .
	sudo docker build -t micro-applications-template:latest -f apps/service-rest-api/Dockerfile --no-cache .

docker-run:
	docker run -it --rm -p 8080:8080 micro-applications-template:latest

docker-prune:
	make persistence-cleanup \
	&& docker volume prune \
	&& docker system prune

docker-config:
	cp .env.example ./apps/_persistence/.env \
	&& cd apps/_persistence && docker-compose config

# Application
auth-prisma-postgresql-setup:
	yarn prisma generate --schema prisma/postgresql.schema.prisma

service-rest-api-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve service-rest-api

consumer-with-api-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve consumer-with-api

service-consumer-serve:
	# The .env in root folder make it possible to use env variables within .env file
	cp .env.example .env && make auth-prisma-postgresql-setup && nx serve service-consumer

# Fly
fly-launch:
	cd apps/service-rest-api && fly launch

fly-deploy:
	cd apps/service-rest-api && fly deploy

fly-logs:
	cd apps/service-rest-api && fly logs

fly-status:
	cd apps/service-rest-api && fly status

fly-status-watch:
	cd apps/service-rest-api && fly status --watch

fly-open:
	cd apps/service-rest-api && fly open

fly-volume-create-data:
	cd apps/service-rest-api && fly vol create data --region gru --size 1

fly-volumes-list:
	cd apps/service-rest-api && fly volumes list

fly-apps-list:
	cd apps/service-rest-api && fly apps list

fly-apps-destroy:
	cd apps/service-rest-api && fly apps destroy black-fog-4181

fly-mount-volume:
	cd apps/service-rest-api && fly m run . -v vol_xme149kwxy3vowpl:/data

fly-secrets-set:
	cd apps/service-rest-api && fly secrets set

fly-secrets-list:
	fly secrets list

terraform-init:
	cd apps/service-iac && terraform init

terraform-plan:
	cd apps/service-iac && terraform plan

terraform-apply:
	cd apps/service-iac && terraform apply

terraform-apply-auto-approve:
  cd apps/service-iac && terraform apply -auto-approve

terraform-destroy:
	cd apps/service-iac && terraform destroy
