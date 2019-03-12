
import * as req from "request-promise-native";

import { Message, RichEmbed } from "discord.js";
import { CommandDefinition, CommandCallback} from "../definitions";

const name  = "about";
const desc  = "";
const help  = "";
class About extends CommandDefinition {
}

const about =
  new About(name, desc, help, async (msg, args) => {

    let embed = new RichEmbed({
      title : "About me"
    });

    embed.addField(
      "Invite link",
      "https://discordapp.com/oauth2/authorize?client_id=549524772396990485&scope=bot&permissions=1073216983"
    );

    embed.addField(
      "Source", "https://github.com/sinecodes/nuncio"
    );

    return embed;

  });

module.exports = about;
