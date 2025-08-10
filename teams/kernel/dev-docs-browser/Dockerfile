# build smaller image for running
# References:
# - https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/
# - https://www.youtube.com/watch?v=vo-NnGHdZFc&ab_channel=Yes%21DoIT
FROM nginx:1.27.4-alpine-slim

## Built-in environment variables

# Add custom nginx configuration
COPY /teams/kernel/dev-docs-browser/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY /dist/teams/kernel/dev-docs-browser /usr/share/nginx/html
RUN cd usr/share/nginx/html && ls -la

CMD ["nginx", "-g", "daemon off;"]