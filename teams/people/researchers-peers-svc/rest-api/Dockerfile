# Start recipe from base image
FROM oven/bun:1.0.3 as base

## Built-in environment variables
ENV PORT="8080"
ENV NODE_ENV="production"
ENV ENV_SILENT=true

## Database provider ("mongodb-mongoose-orm" | "postgresql-prisma-orm" | "postgresql-type-orm" |  "in-memory")
ENV DATABASE_PROVIDER=in-memory

## Events provider ('kafka' | 'in-memory')
ENV EVENTS_PROVIDER=in-memory

## Transporter ('nestjs-default-kafka-transporter' | 'nestjs-custom-kafka-transporter' | 'simple-kafka-transporter')
ENV EVENTS_TRANSPORTER=nestjs-default-kafka-transporter

## Auth
ENV API_KEY=my-secret-api-key

# # Here we define our new ENTRYPOINT_PATH environment variable and its default value.
# ENV ENTRYPOINT_PATH="teams/people/researchers-peers-svc/rest-api/entrypoint.sh"

WORKDIR /app/

# Add the rest of the files
COPY package.json /app/package.json
COPY bun.lockb /app/bun.lockb
COPY /node_modules /app/node_modules
COPY /dist/teams/people/researchers-peers-svc/rest-api /app/dist/teams/people/researchers-peers-svc/rest-api
COPY /teams/people/researchers-peers-svc/rest-api/entrypoint.sh /app/teams/people/researchers-peers-svc/rest-api/entrypoint.sh
COPY /teams/people/researchers/peers/adapters/src/database/infra/prisma /app/teams/people/researchers/peers/adapters/src/database/infra/prisma

# Make the bash script executable
RUN chmod +x /app/teams/people/researchers-peers-svc/rest-api/entrypoint.sh

# # Expose the service api port
EXPOSE 8080

# Start the service using the ENTRYPOINT_PATH environment variable #
ENTRYPOINT ["/bin/bash", "-c", "${ENTRYPOINT_PATH}"]