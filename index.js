// Sophia
'use strict';
require('dotenv').config()
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const START_SEARCH_NO = 'START_SEARCH_NO';
const START_SEARCH_YES = 'START_SEARCH_YES';
const GREETING = 'GREETING';
const AUSTRALIA_YES = 'AUSTRALIA_YES';
const AUSTRALIA_NO = 'AUSTRALIA_NO';
const OTHER_HELP_YES = 'OTHER_HELP_YES';
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v7.0/';

const
  phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(),
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

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
          handleMessage(sender_psid);
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


// ================================
// Begining of Sophia's Code
// ================================
function handleMessage(sender_psid) {
  const response = {
    "text": "Hi are you on the Trash My Trash Team. Message 'Help' at any time for a list of possible commands."
    "quick_replies": [
      {
        "content_type": "text",
        "title": "I'm so excited to join!",
        "payload": START_CONVERSATION
      }
    ]
  };

  // Send the response message
  callSendAPI(sender_psid, response);
}


// This is the intoduction to get a user's state's abbreviation  
function handleAustraliaYesPostback(sender_psid) {
  const askForStateAbbreviation = {
    "text": "What is your state's abbreviation?",
    "quick_replies": [
      {
        "content_type": "state_abbreviation"
      }
     // I want an if/else so if it's in the list of abbreviaitons, it has a payload: START_SEARCH_YES
    ]
  if askForStateAbbreviation in "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", :
    "payload": ABBREVIATION_CORRECT;
  else:
    "payload": ABBREVIATION_INCORRECT;
    
  };
  callSendAPI(sender_psid, askForStateAbbreviation);
}


// This may be another way to get the abbreviation
//function introductionDialogueHandle(sender_psid) {
//  const response = {
//    "text": "To start, please type in your state's abbreviation so we can give you the correct recycling requirements for your state",
//    "quick_replies": [
//      {
        // I want to only post to the webhook if it recognizes that the abbreviation is an actual state, no made up
//        "content_type": "text",
//        "title": "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
//        "payload": START_SEARCH_YES
//      }, {
 //       "content_type": "text",
//        "title": "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", 
//        "payload": START_SEARCH_YES
//      }, {
//        // If not in the the directory, (I don't know how "else" is formated), it gives a different error message
//        "content_type": "text",
//        "title": "",
//        "payload": START_SEARCH_NO
 //     }
//    ]
//  };

// This is the function when the user types in a correct abbreviation. Also starts the recycling dialogue
function rightAbbreviation(sender_psid) {
  const correctAbbreviation = {
    "text": "Thank you. Now we can begin. What would you like to throw away/ recycle today?",
  };
    callSendAPI(sender_psid, correctAbbreviation);
}
    
    
// This is the function when the user types in a wrong abbreviation.
function wrongAbbreviation(sender_psid) {
  const noPayload = {
    "text": "Sorry, we did not find your state abbreviation in our database. Please try again. Ex: New York --> NY, Texas --> TX",
    "quick_replies": [
      {
        "content_type": "text",
        "title": "Ok. I'll try again",
        "payload": TRY_AGAIN
      }
    ]
  };
  callSendAPI(sender_psid, noPayload);
}


function handlePostback(sender_psid, received_postback) {
  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (true) {
    case payload === START_CONVERSATION:
      introductionDialogueHandle(sender_psid);
      break;
    case payload === ABBREVIATION_CORRECT:
      rightAbbreviation(sender_psid);
      break;
    case payload === ABBREVIATION_INCORRECT:
      wrongAbbreviation(sender_psid);
      break;
    case payload === TRY_AGAIN:
      introductionDialogueHandle(sender_psid);
      break;
    case payload === AUSTRALIA_YES:
      handleAustraliaYesPostback(sender_psid);
      break;
    default:
      console.log('Cannot differentiate the payload type, treat it as a emtpy message');
      handleMessage(sender_psid);
  }
}




// ================================
// End of Sophia's Code
// ================================

function handleStartSearchYesPostback(sender_psid) {
  const yesPayload = {
    "text": "Ok then you're cool",
    "quick_replies": [
      {
        "content_type": "text",
        "title": "I want to give you my phone number",
        "payload": AUSTRALIA_YES
      }
    ]
  };
  callSendAPI(sender_psid, yesPayload);
}

function handleStartSearchNoPostback(sender_psid) {
  const noPayload = {
    "text": "You're not cool then",
    "quick_replies": [
      {
        "content_type": "text",
        "title": "Yes.",
        "payload": OTHER_HELP_YES
      }
    ]
  };
  callSendAPI(sender_psid, noPayload);
}

function handleOtherHelpPostback(sender_psid) {
  const campaigns = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": "We need your help",
            "image_url": "http://awsassets.panda.org/img/original/wwf_infographic_tropical_deforestation.jpg",
            "subtitle": "to save our natural world",
            "buttons": [
              {
                "type": "web_url",
                "url": "https://donate.wwf.org.au/campaigns/rhinoappeal/",
                "title": "Javan Rhino Appeal"
              }, {
                "type": "web_url",
                "url": "https://donate.wwf.org.au/campaigns/donate/#AD",
                "title": "Adopt an Animal"
              }, {
                "type": "web_url",
                "url": "https://donate.wwf.org.au/campaigns/wildcards/",
                "title": "Send a wildcard"
              }
            ]
          }
        ]
      }
    }
  };
  callSendAPI(sender_psid, campaigns);
}

function handleGreetingPostback(sender_psid) {
  request({
    url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
    qs: {
      access_token: process.env.PAGE_ACCESS_TOKEN,
      fields: "first_name"
    },
    method: "GET"
  }, function (error, response, body) {
    var greeting = "";
    if (error) {
      console.log("Error getting user's name: " + error);
    } else {
      var bodyObj = JSON.parse(body);
      const name = bodyObj.first_name;
      greeting = "Hi " + name + ". ";
    }
    const message = greeting + "Would you like to join a community of like-minded pandas in your area?";
    const greetingPayload = {
      "text": message,
      "quick_replies": [
        {
          "content_type": "text",
          "title": "Yes!",
          "payload": START_SEARCH_YES
        },
        {
          "content_type": "text",
          "title": "No, thanks.",
          "payload": START_SEARCH_NO
        }
      ]
    };
    callSendAPI(sender_psid, greetingPayload);
  });
}

function handleAustraliaYesPostback(sender_psid) {
  const askForPhoneNumberPayload = {
    "text": "What is your phone number",
    "quick_replies": [
      {
        "content_type": "user_phone_number"
      }
    ]
  };
  callSendAPI(sender_psid, askForPhoneNumberPayload);
}

function handleTestPhone(sender_psid) {
  const phonePayload = {
    "text": "BRB, selling your phone number on the dark web"
  };
  callSendAPI(sender_psid, phonePayload);
}

function handlePostback(sender_psid, received_postback) {
  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (true) {
    case payload === START_SEARCH_YES:
      handleStartSearchYesPostback(sender_psid);
      break;
    case payload === START_SEARCH_NO:
      handleStartSearchNoPostback(sender_psid);
      break;
    case payload === OTHER_HELP_YES:
      handleOtherHelpPostback(sender_psid);
      break;
    case payload === AUSTRALIA_YES:
      handleAustraliaYesPostback(sender_psid);
      break;
    case payload === GREETING:
      handleGreetingPostback(sender_psid);
      break;
    case checkPhoneNumber(payload):
      handleTestPhone(sender_psid);
      break;
    default:
      console.log('Cannot differentiate the payload type, treat it as a emtpy message');
      handleMessage(sender_psid);
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

  // Send the HTTP request to the Messenger Platform
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
}

