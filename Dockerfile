FROM node:latest

WORKDIR /app

COPY package*.json /app
COPY tsconfig.json /app
COPY accounts.json /app
COPY src /app/src

RUN npm ci --only=production
RUN npm run build

CMD [ "node", "app/dist/main.js" ]
