FROM node:22

ENV PORT=80
ENV NODE_ENV=production

EXPOSE ${PORT}

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app/

RUN npm run build

CMD ["node", "build/server.js"]
