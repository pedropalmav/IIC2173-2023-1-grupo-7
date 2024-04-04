FROM node:16-alpine

WORKDIR /usr/src/workers/consumers

COPY package*json ./

RUN npm install

COPY . ./

CMD [ "npm", "start" ]
