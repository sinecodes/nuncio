
import * as req from "request-promise-native";
import { Message, RichEmbed } from "discord.js";

import { CommandDefinition } from "../definitions";
import { appLogger as logger } from "../logging";
import { DEFAULT_COOLDOWN } from "../constants";

const yt_api : string | undefined = process.env.YT_TOKEN;

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

class Yt implements CommandDefinition {

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
      result = this.parse(response);

    } catch (err) {

      logger.error(`${(<Error>err).stack}`)
      return (<Error>err).message;
    
    }

    return result;

  }

  private parse(response : string) : string {

    try {
    
      let data    = JSON.parse(response);
      let first   = data["items"][0];

      return "https://youtu.be/" + first["id"]["videoId"];
    } catch (e) {
      return "Didn't find anything."
    }

  }

}


const yt =
  new Yt(name, desc, help, DEFAULT_COOLDOWN);

module.exports = yt;
