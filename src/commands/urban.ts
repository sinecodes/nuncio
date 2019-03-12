
import * as req from "request-promise-native";
import { Message, RichEmbed } from "discord.js";

import { CommandDefinition, CommandCallback} from "../definitions";
import { appLogger as logger } from "../logging";
import { COLOURS } from "../structs";

const name = "urban";
const desc = "search in urban dictionary";
const help  = `
\`\`\`
Search in urban dictionary

Usage:
urban {term}
\`\`\`
`;

const url  = "http://api.urbandictionary.com/v0/define?term=";

class Urban extends CommandDefinition {
}

function parse(response : string) : RichEmbed {

  let data    = JSON.parse(response);
  let first   = data["list"][0];

  let result      = new RichEmbed({
    title       : "Definition: " + first["word"],
    url         : first["permalink"],
    description : first["definition"],
    color       : COLOURS.get("blue")
  });

  result.addField(
    "Example", first["example"]
  );

  return result;
}

const urban =
  new Urban(name, desc, help, async (msg, args) => {

    var result : RichEmbed | string = `Didn't find anything by ${args.join(" ")}`;

    const endpoint = url + args.join("+");

    const options : req.Options = {
      uri         : endpoint,
      encoding    : "utf-8",
      method      : "GET",
      headers     : {
        "Content-Type" : "application/json"
      }
    };

    try {

      let response = await req.get(options);
      result = parse(response);

    } catch (err) {

      logger.error(`${(<Error>err).stack}`)
      return (<Error>err).message;
    
    }

    return result;

  });

module.exports = urban;
