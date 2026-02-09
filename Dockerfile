# development stage
FROM node:20-alpine as development

WORKDIR /app

COPY package*.json ./

RUN npm install 

# COPY prisma ./prisma  #already mounted prisma in docker-compose.yml

# RUN npx prisma generate  #do not run generate prisma client for development, generating in package.json(instart:dev script) for development.

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# production stage
FROM node:20-alpine as production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma 

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
