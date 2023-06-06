# Use the official image as a parent image
FROM nginx:latest

# Set the working directory
WORKDIR /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run the command
CMD ["nginx", "-g", "daemon off;"]
