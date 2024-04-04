require('dotenv').config();
const mqtt = require('mqtt');
const orm = require('./models');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const { validate: validateUUID } = require("uuid");
const { handleAuction } = require("./src/auctions");


sgMail.setApiKey('key');

const options = {
  // Clean session
  clean: true,
  connectTimeout: 4000,
  // Auth
  username: process.env.USER_AGENT,
  password:  process.env.PASSWORD,
}

const site = "mqtt://".concat(process.env.HOST, ":", process.env.PORT);
const client  = mqtt.connect(site, options);

const topics = ["events/chile", "events/requests", "events/validation", "events/auctions"];

client.on('connect', function () {
  console.log('Connected');

  topics.forEach(topic => {
    client.subscribe(topic, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Subscribed to " + topic);
      }
    });
  });
});

async function saveEvent(message_json) {
  try {
    const new_ticket = await orm.ticket.create({
      name: message_json["name"],
      date:  message_json["date"],
      price:  message_json["price"],
      quantity:  message_json["quantity"],
      location:  message_json["location"],
      latitude:  message_json["latitude"],
      longitude:  message_json["longitude"],
      event_id: message_json["event_id"]
    });
  } catch (exception) {
    console.error("Could not save an event", exception);
  }
}


async function saveRequest(message_json) {
  try {
    let { request_id, group_id, event_id, deposit_token, quantity, seller } = message_json;
    quantity = parseInt(quantity);
    event_id = event_id.trim();

    message_json.event_id = event_id;

    if (request_id === undefined || !validateUUID(request_id)) {
      console.log("Received request with invalid request_id: ", request_id);
      return;
    } else if (group_id === undefined) {
      console.log("Received request with invalid group_id: ", group_id);
      return;
    } else if (event_id === undefined || (await orm.ticket.findOne({ where: {event_id}})) === null) {
      console.log("Received request with invalid event_id: ", event_id);
      return;
    } else if (deposit_token === undefined || typeof deposit_token !== 'string') {
      console.log("Received request with invalid deposit_token: ", deposit_token);
      return;
    } else if (quantity === NaN) {
      console.log("Received request with invalid quantity: ", quantity);
      return;
    } else if (seller === undefined || typeof seller !== 'number') {
      console.log("Received request with invalid seller: ", seller);
      return;
    }

    const request = await orm.Request.create(message_json);
    console.log("Request saved!")

    const event = await request.getEvent();
    event.quantity -= request.quantity;
    await event.save();
    console.log("Event updated!");

  } catch (exception) {
    console.error("Error while validating/saving a request: ", exception);
  }
}

async function generatePdf(request) {
  const userRequest = await request.getUserRequest();
  if (!userRequest) return;

  const event = await request.getEvent();
  if (!event) return;

  const requestBody = {
    email: userRequest.email,
    grupo: "7",
    date: event.date,
    name: event.name,
    price: event.price,
    quantity: request.quantity,
    location: event.location,
    latitude: event.latitude.toString(),
    longitude: event.longitude.toString(),
  };

  const response = await axios.post("https://25dhb6bvk1.execute-api.us-east-2.amazonaws.com/dev/convert", requestBody);
  const pdfLink = response.data.pdfLink;

  if (pdfLink) {
    request.pdf = pdfLink;
    await request.save();
  }

  return pdfLink;
}

async function sendEmail(request, pdfLink) {
  try {
    if (!pdfLink) return;

    const userRequest = await request.getUserRequest();
    if (!userRequest) return;

    const { email } = userRequest;
    if (!email) return;

    const msg = {
      to: email,
      from: 'noreplyarquisise7@gmail.com',
      subject: 'Purchase of Ticket Seller',
      text: `Link of purchase: ${pdfLink}`,
    }

    await sgMail.send(msg);
    console.log("Email sent!");
  } catch (exception) {
    console.error("Error sending email: ", exception);
  }
}

async function handleAdminValidation(request) {
  try {
    const event = await request.getEvent();
    if (!event) return;

    const availableTickets = await event.getAvailableTickets();

    if (!availableTickets) {
      await orm.AvailableTickets.create({ amount: request.quantity, event_id: event.event_id });
    } else {
      availableTickets.amount += request.quantity;
      await availableTickets.save();
    }
    console.log("Available tickets updated!");
  } catch (exception) {
    console.error("Error handling admin validation: ", exception);
  }
}


async function handleValidation(message_json) {
  try {
    const { request_id, group_id, valid } = message_json;

    const request = await orm.Request.findOne({ where: { group_id: group_id.toString(), request_id }});

    if (!request) return;

    request.valid = valid;
    await request.save();
    console.log("Request updated");

    if (!valid) {
      const event = await request.getEvent();
      event.quantity += request.quantity;
      await event.save();
      console.log("Event updated!");
    } else {
      let userRequest = await request.getUserRequest();
      if (!userRequest) return;

      if (userRequest.user_id === 'admin') return handleAdminValidation(request);

      let pdfLink = await generatePdf(request);
      await sendEmail(request, pdfLink);
    }
  } catch (exception) {
    console.error("Error handling a validation: ", exception);
  }
}

client.on('message', function (topic, message) {
  console.log("Message on " + topic);
  const message_json = JSON.parse(message.toString());
  console.log(message_json);

  switch(topic) {
    case 'events/chile':
      saveEvent(message_json);
      break;
    case 'events/requests':
      saveRequest(message_json);
      break;
    case 'events/validation':
      handleValidation(message_json);
      break;
    case 'events/auctions':
      handleAuction(message_json);
      break;
    default:
      console.warn("Unhandled topic: ", topic);
      break;
  }
});
