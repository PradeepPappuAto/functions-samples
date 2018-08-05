'use strict';

const functions = require('firebase-functions');
const paypal = require('paypal-rest-sdk');
// firebase-admin SDK init
const admin = require('firebase-admin');
admin.initializeApp();
// Configure your environment
paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: functions.config().paypal.client_id, // run: firebase functions:config:set paypal.client_id="yourPaypalClientID"
  client_secret: functions.config().paypal.client_secret // run: firebase functions:config:set paypal.client_secret="yourPaypalClientSecret"
});

exports.process = functions.https.onRequest((req, res) => {
  if(req.method !== "POST"){
    res.status(400).send('Please send a POST request');
    return;
  }
  let data = req.body;
  let requestJson = JSON.parse(data)
  const paymentId = requestJson.paymentId;
  const payerId = {
    payer_id: requestJson.payerId
  };
  return paypal.payment.execute(paymentId, payerId, (error, payment) => {
    res.header('Content-Type', 'application/json')
    if (error) {
      console.error(error);
      res.json("{\"successful\":false}")
    } else {
      if (payment.state === 'approved') {
        res.json("{\"successful\":true}")
      } else {
        console.error("Not approved");
        res.json("{\"successful\":false}")
      }
    }
  }).then(r => console.info('promise: ', r));
});
