# Start recipe from base image
FROM node:18.20.7-alpine

## Built-in environment variables
ENV PORT="8080"
ENV NODE_ENV="production"
ENV ENV_SILENT=true

## Database provider ("mongodb" | "in-memory")
ENV DATABASE_PROVIDER=mongodb

WORKDIR /app/

# TODO: stop bringing node_modules from build pipeline once we figure out how to use nx cache from within a docker build process
# Add the rest of the files
COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY /node_modules /app/node_modules
COPY /dist/apps/things/assets-catalog /app/dist/apps/things/assets-catalog
COPY /apps/things/assets-catalog/rest-api/entrypoint.sh /app/apps/things/assets-catalog/rest-api/entrypoint.sh

# Make the bash script executable
RUN chmod +x /app/apps/things/assets-catalog/rest-api/entrypoint.sh

# Expose the service api port
EXPOSE 8080

# Start the service using the ENTRYPOINT_PATH environment variable #
ENTRYPOINT ["/bin/sh", "-c", "${ENTRYPOINT_PATH}"]