FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY services/notification-service ./services/notification-service
RUN npm install
RUN npx turbo run build --filter="@taskforge/*"
WORKDIR /app/services/notification-service
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/notification-service/dist ./services/notification-service/dist
COPY --from=builder /app/services/notification-service/package.json ./services/notification-service/package.json
WORKDIR /app/services/notification-service
EXPOSE 5007
CMD ["npm", "start"]
