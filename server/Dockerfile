# Use specific Node.js version
FROM node:22-alpine

# Workspace directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
# omitting dev dependencies to save space
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]
