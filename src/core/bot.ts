
import { Client, Collection, RichEmbed } from "discord.js";

import { CommandOpt, StringOpt, Commands, Cooldowns  } from "../definitions";
import { commandsCollection } from "./command-handler";
import { isCmdOnCooldown } from "../utils/cmdhelper";
import { appLogger as logger } from "../logging";
import * as cfg from "../../config.json";


class Bot extends Client {

  public commands  : Commands;
  public cooldowns : Cooldowns;

}

const bot     = new Bot();
bot.commands  = commandsCollection;
bot.cooldowns = new Collection();

bot.on("ready", () => {

  logger.info(`Logged in as ${bot.user.tag}.`);

  bot.user.setActivity(`${cfg.prefix}help`);

});

bot.on("message", msg => {

  if (!msg.content.startsWith(cfg.prefix) || msg.author.bot) return;
  if (msg.content.length < 2) return;  // Avoid parsing things like '?*'


  const args : string[] = msg.content.slice(cfg.prefix.length).split(/ +/);
  const cmdOpt : StringOpt = args.shift();
  const cmdName = (cmdOpt === undefined) ? "" : cmdOpt;

  if (bot.commands.has(cmdName)) {

    const command : CommandOpt = bot.commands.get(cmdName);
    if (command === undefined) {

      logger.error(`Undefined module for known loaded command: ${cmdName}`)
      return "That command isn't properly working right now.";
    
    }

    const cooldownResult = isCmdOnCooldown(bot.cooldowns, command, msg.author.id);
    if (cooldownResult !== null) msg.reply(cooldownResult);

    const commandResult : Promise<string | RichEmbed> = command.execute(msg, args);

    commandResult.then(payload => {
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

      const cmd = bot.commands.get(args[0]);

      if ( cmd === undefined ) {

        logger.error(`Undefined help call for known loaded command: ${args[0]}`)
        return "That command isn't properly working right now.";

      } else {
        return msg.channel.send(cmd.help);

      }

    }

  } else {
    return msg.channel.send("No matching command found.");

  }

});

export { bot };
