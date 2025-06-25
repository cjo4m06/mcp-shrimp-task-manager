# Stage 1: Build the application
FROM node:20-slim AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build


# Stage 2: Create the production image
FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/scripts ./scripts
COPY --from=builder /usr/src/app/src/public ./dist/public
COPY --from=builder /usr/src/app/src/prompts/templates_en ./dist/prompts/templates_en
COPY --from=builder /usr/src/app/src/prompts/templates_zh ./dist/prompts/templates_zh

# Expose the server port
EXPOSE 3000

# Define the command to run the application
CMD ["node", "dist/index.js"]
