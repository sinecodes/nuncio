
import { TextChannel } from "discord.js";
import express = require("express");

import { Alert } from "definitions";
import { bot } from "./core/bot";

const port = process.env.PORT || 2001;

bot.login(process.env.TOKEN);

const app = express();
app.use(express.json());
app.use( (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.post("/user-alerts", (req, res) => {


  const payload : Alert[] = req.body;

  try {

    payload.forEach((alarmPayload) => {

      const channel = <TextChannel>bot.channels.get(alarmPayload.channel);
      channel.send(alarmPayload.reason +" " +`<@${alarmPayload.mentions[0]}>`);
      
    });

    res.status(200).send(JSON.stringify(payload)).end();

  } catch (e) {

    switch (e.constructor) {
      case SyntaxError:
      case TypeError:
        res.status(400).send({ "Error" : (<Error>e).message }).end();
    }
  }

});

app.get("/", (req, res) => {
  res.status(200).send({"ok": "ok-value"})

});

app.listen(port, ()=> {
  console.log(`Listening on ${port}`);

});
