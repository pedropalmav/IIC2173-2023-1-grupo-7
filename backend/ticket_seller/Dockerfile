FROM node:16.13.2-alpine3.15 AS base

WORKDIR /ticket_seller

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

COPY package*.json /ticket_seller/

RUN npm install

# Monitoring ENV Variables
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
NEW_RELIC_LOG=stdout

COPY ./ /ticket_seller

RUN chmod +x entrypoint.sh

CMD [ "sh", "/ticket_seller/entrypoint.sh" ]
