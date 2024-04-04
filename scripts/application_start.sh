#!/bin/bash
cd /home/ubuntu/proyecto/backend

cp ~/.env broker/.env
cp ~/.env ticket_seller/.env

echo "Starting service..."
docker rmi $(docker images) -f
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 234329232283.dkr.ecr.us-east-2.amazonaws.com
docker compose -f docker-compose.prod.yml up -d --scale worker=2