# Start recipe from base image
FROM node:18.17.1-alpine

## Built-in environment variables
ENV PORT="8080"
ENV NODE_ENV="production"
ENV ENV_SILENT=true

## Database provider ("mongodb-mongoose-orm" | "postgresql-prisma-orm" | "postgresql-type-orm" |  "in-memory")
ENV DATABASE_PROVIDER=mongodb

WORKDIR /app/

# Add the rest of the files
COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY /node_modules /app/node_modules
COPY /dist/apps/people/organizations-management /app/dist/apps/people/organizations-management
COPY /apps/people/organizations-management/rest-api/entrypoint.sh /app/apps/people/organizations-management/rest-api/entrypoint.sh

# Make the bash script executable
RUN chmod +x /app/apps/people/organizations-management/rest-api/entrypoint.sh

# Expose the service api port
EXPOSE 8080

# Start the service using the ENTRYPOINT_PATH environment variable #
ENTRYPOINT ["/bin/sh", "-c", "${ENTRYPOINT_PATH}"]