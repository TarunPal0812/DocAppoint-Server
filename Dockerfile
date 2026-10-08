FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
RUN npm ci --ignore-scripts

COPY src ./src
COPY migrate-mongo-config.js ./
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/migrate-mongo-config.js ./migrate-mongo-config.js
COPY src/migrations ./src/migrations
COPY src/seed.ts ./src/seed.ts

RUN mkdir -p uploads logs

EXPOSE 3001

CMD ["node", "dist/server.js"]
