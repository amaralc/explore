# build smaller image for running
# References:
# - https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/
# - https://www.youtube.com/watch?v=vo-NnGHdZFc&ab_channel=Yes%21DoIT
FROM nginx:1.25.3-alpine-slim

# Add custom nginx configuration
COPY /apps/people/skill-set/browser/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY /dist/apps/people/skill-set/browser /usr/share/nginx/html
RUN cd usr/share/nginx/html && ls -la

CMD ["nginx", "-g", "daemon off;"]