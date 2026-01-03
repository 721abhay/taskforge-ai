FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY services/analytics-service ./services/analytics-service
RUN npm install
RUN npx turbo run build --filter="@taskforge/*"
WORKDIR /app/services/analytics-service
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/analytics-service/dist ./services/analytics-service/dist
COPY --from=builder /app/services/analytics-service/package.json ./services/analytics-service/package.json
WORKDIR /app/services/analytics-service
EXPOSE 5005
CMD ["npm", "start"]
