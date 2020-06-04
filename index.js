'use strict';
require('dotenv').config()
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const CONNECTION_STRING = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@trashmytrashcluster-yez26.mongodb.net/test?retryWrites=true&w=majority`;
const START_SEARCH_NO = 'START_SEARCH_NO';
const START_SEARCH_YES = 'START_SEARCH_YES';
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v7.0/';
const ITEM = 'ITEM';
const MATERIAL = 'MATERIAL';

console.log(CONNECTION_STRING)
const
  fetch = require('node-fetch'),
  phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(),
  request = require('request'),
  express = require('express'),
  mongoose = require('mongoose'),
  db = require('./dbFunctions.js'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server




mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) throw err;
  console.log("DB Connected Successfully");
})

// Sample code of how to retrieve an user from the mongoDB database

/*
db.getCoords("MO").then((value) => {
  var select_city = value[0];
  db.createUser("bobbbybcd", db.convertUsefulCoords(select_city)).then((value) => {
    db.findUser("bobbbybcd").then((value) => {
      console.log(value);
    })
  })
})
*/




// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log('Webhook event:', webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      } else if (webhook_event.message) {
        console.log('webhook_event.message', JSON.stringify(webhook_event.message));
        console.log('webhook_event.message["quick_reply"]', webhook_event.message["quick_reply"]);
        if (webhook_event.message.quick_reply) {
          handlePostback(sender_psid, webhook_event.message.quick_reply);
        } else {
          handlePostback(sender_psid, webhook_event.message);
        }
      }
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "68hIGOi2qM";

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];

  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid) {
  const response = {
    "text": "Hi are you on the Trash My Trash Team",
    "quick_replies": [
      {
        "content_type": "text",
        "title": "Yes!",
        "payload": START_SEARCH_YES
      }, {
        "content_type": "text",
        "title": "No, thanks.",
        "payload": START_SEARCH_NO
      }
    ]
  };

  // Send the response message
  callSendAPI(sender_psid, response);
}

function handleTestPhone(sender_psid) {
  const phonePayload = {
    "text": "BRB, selling your phone number on the dark web"
  };
  callSendAPI(sender_psid, phonePayload);
}

function handleItemOrMaterial(sender_psid) {
  const choice = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Would you like more information on recycling an item or a material?",
        "buttons": [
          {
            "type": "postback",
            "title": "Item",
            "payload": ITEM
          },
          {
            "type": "postback",
            "title": "Material",
            "payload": MATERIAL
          }
        ]
      }
    }
  };
  // Send the response message
  callSendAPI(sender_psid, choice);
}

function initialGreeting(sender_psid) {
  const greeting = {
    "text": "Hi! Thanks for using the Trash my Trash messenger bot!"
  };

  callSendAPI(sender_psid, greeting).then(() => {
    db.findUser(sender_psid).then((value) => {
      if (value === null) {
        const explain = {
          "text": "Please tell us the city you reside in so we can tailor our information to be more accurate to your local guidelines"
        };
        return callSendAPI(sender_psid, explain).then(() => {
          console.log("this works")
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  })
}
/*
function getState(sender_psid) {
  const explain = {
    "text": "Please tell us the city you reside in so we can tailor our information to be more accurate to your local guidelines"
  };
  callSendAPI(sender_psid, explain)

}
*/

function handleItemPostback(sender_psid) {
  const item = {
    "text": "Please state your item."
  };
  callSendAPI(sender_psid, item);
}

function handleMaterialPostback(sender_psid) {
  const material = {
    "text": "Please state your material."
  };
  callSendAPI(sender_psid, material);
}

function handlePostback(sender_psid, received_postback) {
  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (true) {
    case payload === ITEM:
      handleItemPostback(sender_psid);
      break;
    case payload === MATERIAL:
      handleMaterialPostback(sender_psid);
      break;
    default:
      initialGreeting(sender_psid);
  }
}

function checkPhoneNumber(number) {
  try {
    if (phoneUtil.isValidNumber(phoneUtil.parse(number)))
      return true;
  } catch (err) { console.log(err) }
  return false;
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log('message to be sent: ', response);
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  const qs = 'access_token=' + encodeURIComponent(PAGE_ACCESS_TOKEN); // Here you'll need to add your PAGE TOKEN from Facebook
  return fetch(`${FACEBOOK_GRAPH_API_BASE_URL}/me/messages?` + qs, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request_body),
  });
  // Send the HTTP request to the Messenger Platform
  /*
      request({
        "uri": `${FACEBOOK_GRAPH_API_BASE_URL}me/messages`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (err) {
          console.error("Unable to send message:" + err);
        }
      });
      */
}
