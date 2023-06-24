# Start recipe from base image
FROM node:16.20-slim as base

# Local SSH key in PEM format <--------- IMPORTANT!
# To convert your local private key from OPENSSH to PEM format, use the following command: ssh-keygen -p -N "" -m pem -f /path/to/key
# Example usage:
# ssh-keygen -p -N "" -m pem -f /path/to/key
# sudo docker build -t my-app:latest --build-arg SSH__PEM_PRIVATE_KEY="$$(cat ~/.ssh/id_rsa)" --no-cache .
# ARG SSH_PRIVATE_KEY

# # Install ssh tools and git
RUN apt-get update -y && apt-get install -y openssl

# # Authorize SSH Host
# ## References: https://chmod-calculator.com/
# RUN mkdir -p /root/.ssh && \
#   chmod 0700 /root/.ssh && \
#   ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

# # Add the keys and set permissions
# RUN echo "$SSH_PRIVATE_KEY" > /root/.ssh/id_rsa && \
#   chmod 600 /root/.ssh/id_rsa

FROM base as build

# Avoid cache purge by adding requirements first
# Copy package.json and yarn lock to app directory
# Set workdir
WORKDIR /app/
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install --frozen-lockfile

# # Remove SSH keys
# RUN rm -rf /root/.ssh/

## Environment
ENV NODE_ENV="production"
ENV PORT="8080"
ENV ENV_SILENT=true

## Database provider ("mongodb-mongoose-orm" | "postgresql-prisma-orm" | "postgresql-type-orm" |  "in-memory")
ENV DATABASE_PROVIDER=postgresql-prisma-orm

## Events provider ('kafka' | 'in-memory')
ENV EVENTS_PROVIDER=in-memory

## Transporter ('nestjs-default-kafka-transporter' | 'nestjs-custom-kafka-transporter' | 'simple-kafka-transporter')
ENV EVENTS_TRANSPORTER=nestjs-default-kafka-transporter

## Auth
ENV API_KEY=my-secret-api-key

# Add the rest of the files
COPY . .

RUN echo 'Generating Prisma Client...'

# Setup client and environment variables
RUN yarn prisma:generate:postgres

# Build the service api
# Creates a "dist" folder with the production build
RUN yarn build:researchers-peers-svc-rest-api

# build smaller image for running
FROM base


ENV PORT="8080"
ENV NODE_ENV="production"

## Database provider ("mongodb-mongoose-orm" | "postgresql-prisma-orm" | "postgresql-type-orm" |  "in-memory")
ENV DATABASE_PROVIDER=postgresql-prisma-orm

## Events provider ('kafka' | 'in-memory')
ENV EVENTS_PROVIDER=in-memory

## Transporter ('nestjs-default-kafka-transporter' | 'nestjs-custom-kafka-transporter' | 'simple-kafka-transporter')
ENV EVENTS_TRANSPORTER=nestjs-default-kafka-transporter

## Auth
ENV API_KEY=my-secret-api-key

# Here we define our new ENTRYPOINT_PATH environment variable and its default value.
ENV ENTRYPOINT_PATH="apps/researchers/peers/svc-rest-api/entrypoint.sh"

WORKDIR /app/
COPY package.json yarn.lock ./

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/apps/researchers/peers/svc-rest-api/entrypoint.sh /app/apps/researchers/peers/svc-rest-api/entrypoint.sh
COPY --from=build /app/libs/researchers/peers/adapters/src/database/infra/prisma /app/libs/researchers/peers/adapters/src/database/infra/prisma

# Make the bash script executable
RUN chmod +x /app/apps/researchers/peers/svc-rest-api/entrypoint.sh

# # Expose the service api port
EXPOSE 8080

# Start the service using the ENTRYPOINT_PATH environment variable
ENTRYPOINT ["/bin/bash", "-c", "${ENTRYPOINT_PATH}"]
