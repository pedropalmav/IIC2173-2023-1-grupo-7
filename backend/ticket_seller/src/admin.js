const { Router } = require('express');
const { v4: uuid } = require("uuid");
const mqtt = require("mqtt");
const axios = require("axios");

const orm = require('./models');

const router = Router();

const WORKERS_MANAGER = "workers_manager:3002";


// MQTT
const options = {
  // Clean session
  clean: true,
  connectTimeout: 4000,
  // Auth
  username: process.env.MQTT_USERNAME,
  password:  process.env.MQTT_PASSWORD,
}

const site = "mqtt://".concat(process.env.MQTT_HOST, ":", process.env.MQTT_PORT);
const client  = mqtt.connect(site, options);
client.on('connect', () => console.log("Auctions connected to the broker!"));
const TOPIC = "events/requests";

async function makePaymentRequest(request, value) {
    const requestBody = {
        event_id: request.event_id,
        quantity: request.quantity,
        request_id: request.request_id,
        group_id: request.group_id,
        seller: request.seller,
        value,
    };

    const response = await axios.post("https://api.legit.capital/v1/payments", requestBody);

    if (response.status != 200) {
        throw new Error("Payment request failed");
    }
    console.log("Payment request successful");
    const { deposit_token, challenges } = response.data;

    await orm.Challenge.create({deposit_token});

    challenges.forEach(async (challenge) => {
        const data = {
            deposit_token,
            challenge_id: challenge.challenge_id,
            challenge_hash: challenge.challenge_hash,
        };

        let jobResponse = await axios.post(`http://${WORKERS_MANAGER}/job`, data);

        await orm.Job.create({
            deposit_token,
            challenge_id: challenge.challenge_id,
            job_id: jobResponse.data,
        });
    });

    console.log("Deposit token: ", deposit_token);
    console.log("Challenges: ", challenges);

    return deposit_token;
}

async function buyTicket(event_id, quantity) {
    try {
        const event = await orm.ticket.findOne({ where: { event_id } });
        
        const price = event.price;

        const request = {
            request_id: uuid(),
            group_id: 7,
            event_id,
            deposit_token: '',
            quantity,
            seller: 7,
        };

        let deposit_token = await makePaymentRequest(request, price);
        request.deposit_token = deposit_token;

        return request;
    } catch (err) {
        console.log("Error buying ticket: ", err);
    }
}

async function publishTicketRequest(request) {
    await client.publish(TOPIC, JSON.stringify(request));

    await orm.UserRequest.create({
        request_id: request.request_id,
        user_id: 'admin'
    });

    console.log("Ticket request published");
}


router.post('/buy', async (req, res) => {
    try {
        const { event_id, quantity } = req.body;

        if (event_id == null || quantity == null) {
            res.status(400).json({message: "Missing event_id or quantity"});
            return;
        }

        const request = await buyTicket(event_id, quantity);

        if (!request) {
            res.status(500).json({message: "Error buying ticket"});
            return;
        }

        await publishTicketRequest(request);
        res.sendStatus(201);
    } catch (err) {
        console.log("Error while creating a new request: ", err);
        res.status(500).json({message: err.message});
    }
});

exports.router = router;
