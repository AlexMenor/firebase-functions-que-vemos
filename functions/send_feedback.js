const { VALID_MEMORY_OPTIONS } = require("firebase-functions");
const functions = require("firebase-functions");
const https = require("https");
const badWords = require("./bad-words");

const CHANNEL_NAME = "@sugerenciasQueVemos";

exports.sendFeedback = functions.https.onRequest((request, response) => {
  const { feedback } = request.body;

  if (!feedback)
    return response
      .status(400)
      .send("Could not find a feedback field in the request body");

  if (isOffensive(feedback))
    return response.status(400).send("Your feedback is not useful");

  sendMsgToTelegram(feedback)
    .then(() => {
      return response.send({ msg: "Feedback sent" });
    })
    .catch(() => {
      return response.status(500).send("Something went wrong");
    });
});

function sendMsgToTelegram(msg) {
  return new Promise((resolve, reject) => {
    https.get(
      `https://api.telegram.org/bot${
        functions.config()["que-vemos"].telegram
      }/sendMessage?chat_id=${CHANNEL_NAME}&text=${msg}`,
      (response) => {
        if (response.statusCode !== 200) {
          functions.logger.log(response);
          reject(new Error());
        } else resolve();
      }
    );
  });
}

function isOffensive(msg) {
  const msgWords = msg.split(" ");

  return msgWords.some((word) => badWords.includes(word));
}
