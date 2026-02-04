# builder stage
FROM node:20

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install 

COPY . .

RUN npx prisma generate
RUN npm run build 

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# production stage
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && node dist/main.js"



