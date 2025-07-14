# stage 1: Build the application
FROM node:23-slim AS builder

# Set working directory
WORKDIR /app

#Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Define build arguments for environment variables
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL

# Set environment variables for build
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy the built application from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

COPY  nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
#EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
