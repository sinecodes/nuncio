
import { HowLongToBeatService, HowLongToBeatEntry } from "howlongtobeat";

import { Message, RichEmbed } from "discord.js";
import { CommandDefinition } from "../definitions";
import { DEFAULT_COOLDOWN } from "../constants";

const name = "hltb";
const desc = "search information in howlongtobeat";
const help = `
\`\`\`
Search in How Long To Beat.

Usage:
hltb {game name}
\`\`\`
`;

class Hltb implements CommandDefinition {

  name        : string;
  description : string;
  help        : string | RichEmbed;
  cooldown    : number;

  service : HowLongToBeatService;

  constructor (

    _name        : string,
    _description : string,
    _help        : string | RichEmbed,
    _cooldown    : number,
    _service     : HowLongToBeatService
  
  ) {

    this.name        = _name;
    this.description = _description;
    this.help        = _help;
    this.cooldown    = _cooldown;
    this.service     = _service;
  
  }

  async execute (msg: Message, args: string[]) : Promise<string | RichEmbed> {

    var result : RichEmbed | string = `Didn't find anything by ${args.join(" ")}`;

    try {

      let response : Array<HowLongToBeatEntry> = 
        await this.service.search(args.join(" "));

      result = this.parse(response[0]);

    } catch (err) {
      return (<Error>err).message;

    }


    return result;

  }

  private parse(payload : HowLongToBeatEntry) : RichEmbed {

    let embed : RichEmbed = new RichEmbed({
      title : payload.name
    });

    embed.addField(
      "Main", payload.gameplayMain
    );

    embed.addField(
      "Main + extras", payload.gameplayMainExtra
    );

    embed.addField(
      "Completionist", payload.gameplayCompletionist
    );

    embed.setThumbnail(payload.imageUrl);
    embed.setFooter(`Confidence: ${payload.similarity}`);

    return embed;
  }

}

const hltb =
  new Hltb(name, desc, help, DEFAULT_COOLDOWN, new HowLongToBeatService());

module.exports = hltb;
