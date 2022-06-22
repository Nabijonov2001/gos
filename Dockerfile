FROM node:16.14.0-alpine

WORKDIR /gos-project/backend

ADD package*.json ./

RUN npm install

ADD . .

EXPOSE 7000

CMD [ "npm", "start" ]