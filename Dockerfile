FROM node:22

ENV PORT=80

EXPOSE ${PORT}

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app/

RUN npm run build

ENV NODE_ENV=production

CMD ["node", "build/server.js"]
