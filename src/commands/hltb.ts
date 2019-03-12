
import * as req from "request-promise-native";
import { HowLongToBeatService, HowLongToBeatEntry } from "howlongtobeat";

import { Message, RichEmbed } from "discord.js";
import { CommandDefinition, CommandCallback} from "../definitions";
import { COLOURS } from "../structs";

const name = "hltb";
const desc = "search information in howlongtobeat";
const help  = `
\`\`\`
Search in How Long To Beat.

Usage:
hltb {game name}
\`\`\`
`;


function parse(payload : HowLongToBeatEntry) : RichEmbed {

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

class Hltb extends CommandDefinition {

  service : HowLongToBeatService;

  constructor(_name : string, _desc : string, _help : string, _ex : CommandCallback) {

    super(_name, _desc, _help, _ex);
    this.service = new HowLongToBeatService();

  }

}

const hltb =
  new Hltb(name, desc, help, async (msg, args) => {

    var result : RichEmbed | string = `Didn't find anything by ${args.join(" ")}`;

    try {

      let response : Array<HowLongToBeatEntry> = 
        await hltb.service.search(args.join(" "));

      result = parse(response[0]);

    } catch (err) {
      return (<Error>err).message;

    }


    return result;

  });

module.exports = hltb;
