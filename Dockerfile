# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application (assumes "build" script in package.json)
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port (Adjust if you use a different port)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main.js"]