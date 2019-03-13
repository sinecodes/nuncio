
import * as req from "request-promise-native";
import { RichEmbed } from "discord.js";

import { CommandDefinition } from "../definitions";
import { appLogger as logger } from "../logging";

const yt_api : string = process.env.YT_TOKEN;

const name = "yt";
const desc = "search in youtube";
const help = `
\`\`\`
Search in youtube

Usage:
yt {term}
\`\`\`
`;

const url  = "https://content.googleapis.com/youtube/v3/search";

class Yt extends CommandDefinition {
}

function parse(response : string) : string {

  try {
  
    let data    = JSON.parse(response);
    let first   = data["items"][0];

    return "https://youtu.be/" + first["id"]["videoId"];
  } catch (e) {
    return "Didn't find anything."
  }

}

const yt =
  new Yt(name, desc, help, async (msg, args) => {

    var result : RichEmbed | string = `Didn't find anything by ${args.join(" ")}`;

    const endpoint = `${url}?q=${args.join("+")}&key=${yt_api}&part=snippet&maxresults=1`;

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

module.exports = yt;
