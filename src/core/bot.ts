
import * as Discord from "discord.js";

import { appLogger as logger } from "../logging";
import * as cfg from "../../config.json";
import { CommandDefinition } from "../definitions";
import { commandsCollection } from "./command-handler";


class Bot extends Discord.Client {

  public commands : Discord.Collection<string, CommandDefinition>;
  public cooldowns: Discord.Collection<string, Discord.Collection<string, number>>;

}

const bot       = new Bot();
bot.commands    = commandsCollection;
bot.cooldowns   = new Discord.Collection();

bot.on("ready", () => {
  logger.info(`Logged in as ${bot.user.tag}.`);
  bot.user.setActivity(`${cfg.prefix}help`);
});

bot.on("message", msg => {

  if (!msg.content.startsWith(cfg.prefix) || msg.author.bot) return;
  if (msg.content.length < 2) return;  // Avoid parsing on things like '?*'


  const args : string[]   = msg.content.slice(cfg.prefix.length).split(/ +/);
  const cmdName : string  = args.shift().toLowerCase();

  if (bot.commands.has(cmdName)) {
    const command : CommandDefinition = bot.commands.get(cmdName);

    if (! bot.cooldowns.has(cmdName)) {
      bot.cooldowns.set(cmdName, new Discord.Collection());
    }

    const now       = Date.now();
    const timestamps= bot.cooldowns.get(cmdName);
    const cmdCool   = (command.cooldown || 5) * 1000;

    if (timestamps.has(msg.author.id))  {
      const expirationTime = timestamps.get(msg.author.id) + cmdCool;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return msg.reply(
          `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
        );
      } else {
        timestamps.delete(msg.author.id);

      }

    
    } else {
      timestamps.set(msg.author.id, now);
    
    }

    const result : Promise<string | Discord.RichEmbed> = command.execute(msg, args);

    result.then(payload => {
      return msg.channel.send(payload);

    }).catch( err => {

      logger.error(`${<Error>err.stack}`);
      return msg.channel.send("Something went wrong; try again later.");

    });


  } else if (cmdName === "help" ){
    if (args.length === 0){

      const keys = bot.commands.keyArray();
      return msg.channel.send(`List of available cmds: ${keys.join(", ")}.`)

    } else {
      return msg.channel.send(bot.commands.get(args[0]).help);

    }

  } else {
    return msg.channel.send("No matching command found.");

  }

});

export { bot };
