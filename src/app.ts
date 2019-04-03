
import express = require("express");

import { TextChannel } from "discord.js"

import { bot } from "./core/bot";
import { AlarmRepo } from "data/datetime";

const port = process.env.PORT || 2001;

bot.login(process.env.TOKEN);

const app = express();
app.use(express.json());

app.listen(port, ()=> {
  console.log(`Listening on ${port}`);

});

const alarmRepo = new AlarmRepo();

while ( true ) {

  setTimeout( async () => {

    alarmRepo.getCurrentAlarms().then(payload => {

      const available = bot.channels;

      payload.forEach(alarm => {

        const currentIdentifier = alarm.channelId;

        if ( currentIdentifier in available) {

          const channel = bot.channels.get(currentIdentifier) as (TextChannel | undefined);
          if (channel !== undefined) channel.send(alarm.msg);

        }
        
      });
    
    }).catch(e => { console.log((<Error>e).message); } );

  }, 60_000);

}
