const { Router } = require('express');
const { v4: uuid } = require("uuid");
const mqtt = require("mqtt");


const orm = require('./models');

const router = Router();

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
const TOPIC = "events/auctions";



// Get published auctions
router.get('/', async (req, res) => {
    try {
        const auctions = await orm.Auction.findAll({
            where: {
                group_id: 7, 
                type: "offer"
            }, 
            include: 
            [
                "event", 
                {
                    model: orm.Auction,
                    as: "proposals",
                    where: {
                        type: "proposal",
                    },
                    required: false,
                },
            ]
        });
        res.json(auctions);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

// Publish new auction
router.post('/', async (req, res) => {
    try {
        let { event_id, quantity } = req.body;

        if (event_id == null || quantity == null) {
            res.status(400).json({message: "Missing event_id or quantity"});
            return;
        }

        const auction_id = uuid();
        const proposal_id = "";
        const group_id = 7;
        quantity = parseInt(quantity);
        type = "offer";

        if (quantity <= 0) {
            res.status(400).json({message: "Quantity must be greater than 0"});
            return;
        }

        const event = await orm.ticket.findOne({where: {event_id}});
        if (event == null) {
            res.status(400).json({message: "Event not found"});
            return;
        }

        const auction = {
            auction_id,
            proposal_id,
            event_id,
            quantity,
            group_id,
            type,
        }

        client.publish(TOPIC, JSON.stringify(auction));
        res.status(201).json(auction);

        console.log("Auction published", auction);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

// Get published proposals
router.get('/proposals', async (req, res) => {
    try {
        const proposals = await orm.Auction.findAll({
            where: {
                group_id: 7,
                type: "proposal",
            },
            include: "event",
        });
        res.json(proposals);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

// Publish new proposal
router.post('/proposals', async (req, res) => {
    try {
        let { auction_id, quantity } = req.body;

        if (auction_id == null || quantity == null) {
            res.status(400).json({message: "Missing auction_id or quantity"});
            return;
        }

        const proposal_id = uuid();
        const group_id = 7;
        quantity = parseInt(quantity);
        type = "proposal";

        if (quantity <= 0) {
            res.status(400).json({message: "Quantity must be greater than 0"});
            return;
        }

        const auction = await orm.Auction.findOne({where: {auction_id}});
        if (auction == null) {
            res.status(400).json({message: "Auction not found"});
            return;
        }

        const event_id = auction.event_id;

        const proposal = {
            auction_id,
            proposal_id,
            event_id,
            quantity,
            group_id,
            type,
        }

        client.publish(TOPIC, JSON.stringify(proposal));
        res.status(201).json(proposal);

        console.log("Proposal published", proposal);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

async function getProposalResponse(req, res) {
    let { auction_id, proposal_id } = req.body;

    if (auction_id == null || proposal_id == null) {
        res.status(400).json({message: "Missing auction_id or proposal_id"});
        return;
    }

    const auction = await orm.Auction.findOne({where: {auction_id, proposal_id: ""}});
    if (auction == null) {
        res.status(400).json({message: "Auction not found"});
        return;
    }

    const proposal = await orm.Auction.findOne({where: {auction_id, proposal_id}});
    if (proposal == null) {
        res.status(400).json({message: "Proposal not found"});
        return;
    }

    const event_id = auction.event_id;
    const quantity = proposal.quantity;
    const group_id = 7;

    const response = {
        auction_id,
        proposal_id,
        event_id,
        quantity,
        group_id,
    };

    return response;
}

// Accept proposal
router.post('/accept', async (req, res) => {
    try {
        const acceptance = await getProposalResponse(req, res);
        if (acceptance == null) {
            return;
        }
        acceptance.type = "acceptance";

        client.publish(TOPIC, JSON.stringify(acceptance));
        res.status(201).json(acceptance);

        console.log("Acceptance published", acceptance);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

// Reject proposal
router.post('/reject', async (req, res) => {
    try {
        const rejection = await getProposalResponse(req, res);
        if (rejection == null) {
            return;
        }
        rejection.type = "rejection";

        client.publish(TOPIC, JSON.stringify(rejection));
        res.status(201).json(rejection);

        console.log("Rejection published", rejection);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

// Get published offers
router.get('/offers', async (req, res) => {
    try {
        const offers = await orm.Auction.findAll({
            where: {
                group_id: {
                    [orm.Sequelize.Op.ne]: 7,
                },
                type: "offer",
            },
            include: [
                "event",
                {
                    model: orm.Auction,
                    as: "proposals",
                    where: {
                        type: "proposal",
                    },
                    required: false,
                },
            ],
        });
        res.json(offers);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

exports.router = router;
