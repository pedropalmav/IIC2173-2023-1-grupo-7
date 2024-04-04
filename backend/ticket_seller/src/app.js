require('dotenv').config();
const express = require("express"); 
const orm = require('./models');
const mqtt = require("mqtt");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const newrelic = require("newrelic");

const auction = require('./auctions');
const admin = require('./admin');

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

const WORKERS_MANAGER = "workers_manager:3002";

client.on('connect', () => console.log("Connected to the broker!"));



const app = express();
// Use cors middleware
let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions ))

app.use(express.json());

app.set('trust proxy', 1) // trust first proxy :)

app.use("/auctions", auction.router);
app.use("/admin", admin.router);

// Check wallet Admin 
// GET route to fetch wallet information
app.get('/wallet_admin', async (req, res) => {

  try {
    const response = await axios.get(`https://api.legit.capital/v1/wallet/7`);
    const walletData = response.data;
    
    res.json(walletData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet information' });
  }
});

// Wallet
app.options('/add_money', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // Replace * with the allowed origin domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Set the maximum age (in seconds) for which the preflight response can be cached
  res.header('Access-Control-Max-Age', '86400');

  // Send an empty response with a 204 status code
  res.status(204).send();
  });

  
app.route("/add_money").post(async (req, res, next) => {
  
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Retrieve the user_id and money from the request body
    const { user_id, money } = req.body;
    
    console.log(`user_id=${user_id} and money=${money}`);
    
    let wallet = await orm.Wallet.findOne({ where: { user_id } });
    if (!wallet) {
      wallet = await orm.Wallet.create({ user_id, money: 0 });
    }
    
    wallet.money += parseFloat(money);
    await wallet.save();

    return res.json({ message: "Money added successfully" });
  } catch (error) {
    console.log(error);
  }
});



app.options('/check_balance', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // Replace * with the allowed origin domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Set the maximum age (in seconds) for which the preflight response can be cached
  res.header('Access-Control-Max-Age', '86400');

  // Send an empty response with a 204 status code
  res.status(204).send();
  });

app.route("/check_balance").get(async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    // monitoring with new relic
    newrelic.incrementMetric('Check_balance/NumberOfCalls', 1);
    const transaction = newrelic.startWebTransaction('/check_balance');
  
    const { user_id } = req.query;
    const wallet = await orm.Wallet.findOne({ where: { user_id } });
  
    if (!wallet) {
        wallet = await orm.Wallet.create({ user_id, money: 0 });
    }
  
    res.send(wallet.money.toString());
    
    transaction.end();
  }
  catch (error) {
    console.log(error);
  }
  
});



const ITEMS_PER_PAGE = 25;

app.route('/events').get((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  const page = +req.query.page || 1;
  let totalItems;

  orm.ticket
    .count()
    .then((count) => {
      totalItems = count;
      return orm.ticket.findAll({
        attributes: [
          'name',
          'date',
          'price',
          'quantity',
          'location',
          'latitude',
          'longitude',
          'event_id',
        ],
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        include: {
          association: "availableTickets",
          required: false,
          attributes: ['amount'],
        },
      });
    })
    .then((data) => {
      res.send({
        tickets: data,
        currentPage: page,
        total: totalItems,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});


app.options('/buy', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // Replace * with the allowed origin domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Set the maximum age (in seconds) for which the preflight response can be cached
  res.header('Access-Control-Max-Age', '86400');

  // Send an empty response with a 204 status code
  res.status(204).send();
});



const makePaymentRequest = async (request, value) => {
  const requestBody = {
    event_id: request.event_id,
    quantity: request.quantity,
    request_id: request.request_id,
    group_id: 7,
    seller: request.seller,
    value: value
  };

  // Send the POST request to the payment endpoint using axios
  const response = await axios.post("https://api.legit.capital/v1/payments", requestBody);

  if (response.status !== 200) throw new Error("Error making the payment request");
  console.log("Payment request submitted successfully");

  console.log(response.data);
  const { deposit_token, challenges } = response.data;

  await orm.Challenge.create({deposit_token});

  // Send the deposit token and challenges to the workers manager
  challenges.forEach(async challenge => {
    const data = {
      deposit_token,
      challenge_id: challenge.challenge_id,
      challenge_hash: challenge.challenge_hash
    };

    let jobResponse = await axios.post(`http://${WORKERS_MANAGER}/job`, data);

    // Save job id in the database
    await orm.Job.create(
      {deposit_token,
       challenge_id: challenge.challenge_id,
       job_id: jobResponse.data,
      });
  });
  
  console.log("Deposit Token:", deposit_token);
  console.log("Challenges:", challenges);

  return deposit_token;
};

async function buyTicket(event_id, quantity, user_id) {
  try {
    const ticket = await orm.ticket.findOne({ where: { event_id }});

    const price = ticket.price;
    const totalMoneyToSpend = price * quantity;

    const request = {
      request_id: uuid(),
      group_id: '7',
      event_id,
      deposit_token: '',
      quantity,
      seller: 0,
    }

    let wallet = await orm.Wallet.findOne({ where: { user_id } });

    if (!wallet) {
      console.log("Didn't find wallet");
      return null;
    }

    if (wallet.money < totalMoneyToSpend) {
      console.log("User doesn't have enough money");
      return null;
    }

    let deposit_token = await makePaymentRequest(request, price);
    request.deposit_token = deposit_token;

    wallet.money -= totalMoneyToSpend;
    await wallet.save();

    return request;
  } catch (error) {
    console.error("Error buying ticket:", error);
  }
}

async function checkUserHasEnoughMoney(event_id, quantity, user_id) {
  try {
    const ticket = await orm.ticket.findOne({ where: { event_id }});

    if (!ticket) {
      console.log("Event not found:", event_id);
      return false;
    }
  

    const { price } = ticket;
    const amount = quantity;

    const totalMoneyToSpend = price*amount;

    let wallet = await orm.Wallet.findOne({ where: { user_id } });

    if (wallet) {
      return wallet.money >= totalMoneyToSpend;
    } else {
      console.log("Didn't findn the wallet of ", user_id);
      return false;
    }
  } catch (error) {
    console.error("Error checking the wallet", error);
  }
}

async function publishTicketRequest(request, user_id, email) {
  await client.publish("events/requests", JSON.stringify(request));

  // Assign the request to the user.
  await orm.UserRequest.create({ user_id, request_id: request.request_id, email });

  console.log("Request sent: ", request);
}


app.route("/buy").post(async (req, res, next) => {
  try {
    const { event_id, quantity, user_id, email } = req.query;

    if (!event_id || !quantity || !user_id) return res.sendStatus(400);

    const hasEnoughMoney = await checkUserHasEnoughMoney(event_id, quantity, user_id);

    if (!hasEnoughMoney) {
      console.log("User doesn't have enough money");
      return res.status(400).send("User doesn't have enough money");
    }

    const request = await buyTicket(event_id, quantity, user_id);

    if (!request) {
      console.log("Error buying ticket");
      return res.status(400).send("Error buying ticket");
    }

    await publishTicketRequest(request, user_id, email);    

    res.sendStatus(201);
  } catch (exception) {
    console.error("Error while creating a new request: ", exception);
    res.sendStatus(500);
  }
  });

app.get("/workers_status", async (req, res) => {
    try {
        const response = await axios.get(`http://${WORKERS_MANAGER}/heartbeat`);

        res.status(200).send({status: response.data})
        
    } catch(error) {
        console.error(error);
        res.status(200).send({status: false});
    }
});


app.options('/requests', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // Replace * with the allowed origin domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Set the maximum age (in seconds) for which the preflight response can be cached
  res.header('Access-Control-Max-Age', '86400');

  // Send an empty response with a 204 status code
  res.status(204).send();
  });
      
  app.route("/requests/:userid")
  .get(async (req, res, next) => {
      try {
          const user_id = req.params.userid;
          console.log(req.originalUrl);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
          res.setHeader('Access-Control-Allow-Credentials', true);

          console.log(user_id);
          console.log(req.query);

          if (!user_id) return res.sendStatus(400);

          const requests = await orm.UserRequest.findAll({
            where: { user_id }, 
            include: { all: true, nested: true, required: true },
            });

          res.json(requests);
        } catch(exception) {
          console.error("Could not retrieve user's request: ", exception);
        }
      });


async function checkChallengesResult() {
  console.log("Checking challenges result");

  const pendingChallenges = await orm.Challenge.findAll({ where: { status: 'pending' } });

  pendingChallenges.forEach(async challenge => {
    const jobs = await orm.Job.findAll({ where: { deposit_token: challenge.deposit_token } });

    let allJobsCompleted = true;
    jobs.forEach(async job => {
      if (job.status !== 'completed') {
        allJobsCompleted = false;

        const jobData = await axios.get(`http://${WORKERS_MANAGER}/job/${job.job_id}`);
        const secret = jobData.data.returnvalue;

        if (secret) {
          job.status = 'completed';
          job.secret = secret;
          await job.save();
        }
      }
    });

    if (allJobsCompleted) {
      challenge.status = 'completed';
      console.log("All jobs completed for deposit_token: ", challenge.deposit_token)
      
      const challengeData = jobs.map(job => {
        return {challenge_id: job.challenge_id, secret: job.secret};
      });

      const data = {
        deposit_token: challenge.deposit_token,
        challenges: challengeData,
      }

      console.log(data);

      let response = await axios.post("https://api.legit.capital/v1/challenges/solution", data);
      console.log(response.status)

      await challenge.save();
    }
  });
}

setInterval(checkChallengesResult, 30000);
  
module.exports = app;
