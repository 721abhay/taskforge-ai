FROM node:20-alpine AS builder

WORKDIR /app

# Copy the monorepo root config
COPY package*.json ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy the service code
COPY services/project-service ./services/project-service

# Install dependencies (using workspaces)
RUN npm install

# Build the shared packages first
RUN npx turbo run build --filter="@taskforge/*"

# Build the service
WORKDIR /app/services/project-service
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/project-service/dist ./services/project-service/dist
COPY --from=builder /app/services/project-service/package.json ./services/project-service/package.json

WORKDIR /app/services/project-service

EXPOSE 5002

CMD ["npm", "start"]
