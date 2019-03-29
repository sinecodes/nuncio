
import { Message, RichEmbed } from "discord.js";
import { CommandDefinition } from "../definitions";
import { DEFAULT_COOLDOWN } from "../constants";

const name  = "about";
const desc  = "";
const help  = "";

class About implements CommandDefinition {

  name        : string;
  description : string;
  help        : string | RichEmbed;
  cooldown    : number;

  constructor (

    _name        : string,
    _description : string,
    _help        : string|RichEmbed,
    _cooldown    : number
  
  ) {

    this.name        = _name;
    this.description = _description;
    this.help        = _help;
    this.cooldown    = _cooldown;
  
  }

  async execute (msg: Message, args: string[]) : Promise<string | RichEmbed> {

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

  }
  
}

const about =
  new About(name, desc, help, DEFAULT_COOLDOWN);

module.exports = about;
