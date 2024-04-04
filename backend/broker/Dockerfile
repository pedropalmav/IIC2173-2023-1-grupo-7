FROM node:16.13.2-alpine3.15 AS base

WORKDIR /broker

ARG DB_NAME
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DIALECT
ARG DB_HOST

ENV DB_NAME $DB_NAME
ENV DB_USERNAME $DB_USERNAME
ENV DB_PASSWORD $DB_PASSWORD
ENV DB_DIALECT $DB_DIALECT
ENV DB_HOST $DB_HOST

COPY package*.json /broker/

RUN npm install

COPY . /broker/

RUN chmod +x entrypoint.sh

CMD [ "sh", "/broker/entrypoint.sh" ]
