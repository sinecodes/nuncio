
import sxml = require("sxml");
import XML = sxml.XML;
import XMLList = sxml.XMLList;

import * as req from "request-promise-native";
import { RichEmbed } from "discord.js";

import { CommandDefinition } from "../definitions";
import { appLogger as logger } from "../logging";

const name = "bgg";
const desc = "search bgg";
const help = `
\`\`\`
Search for boardgames in BGG

Usage:
yt {term}
\`\`\`
`;

const baseURL = "https://www.boardgamegeek.com/xmlapi2/";
const types   = "boardgame,boardgameexpansion,videogame";

class BGG extends CommandDefinition {
}

function decodeHtml(text : string) : string {
  return text
    .replace(/&amp;/g  , '&')
    .replace(/&lt;/g   , '<')
    .replace(/&mdash;/g, '-')
    .replace(/&gt;/g   , '>')
    .replace(/&quot;/g , '"')
    .replace(/&#10;/g  , '\n')
    .replace(/&#039;/g , '\'');
}

function parse(response : XML) : string | RichEmbed {

  let result : string | RichEmbed = "Didn't find anything.";

  try {

    let unparsed = response.get("name").at(0).getProperty("value");
    let _title : string = decodeHtml(unparsed);

    result = new RichEmbed({
      title : _title
    });

    let description : string = decodeHtml(response.get("description").at(0).getValue());
    description = description.length < 1024 ? description : description.slice(0, 1020)+"...";

    result.addField(
      "Description",
      description
      
    );

    try {

      let footer : string = 
        `Playing time: ${response.get("playingtime").at(0).getProperty("value")}h`;

      footer = footer + " | Players: ";
      footer = footer + `(${response.get("minplayers").at(0).getProperty("value")}`;
      footer = footer + ` - ${response.get("maxplayers").at(0).getProperty("value")})`;
      

      result.setFooter(footer);

    } catch (err){
      // Some items don't seem to have some attributes. It's fine to let it fail when
      // that happens.
      
    }

    result.setThumbnail(response.get("thumbnail").at(0).getValue());
  

  } catch (e) {
    return `Error deserializing, did the schema change?: ${(<Error>e).message}`;

  }

  return result;

}

async function searchQuery(str : string) : Promise<XMLList | null> {

  const searchEndpoint = `${baseURL}search?query=${str}&type=${types}`;

  const searchOpts : req.Options = {
    uri         : searchEndpoint,
    encoding    : "utf-8",
    method      : "GET",
    headers     : {
      "Content-Type" : "application/json"
    }
  };

  let response : string = await req.get(searchOpts) ;
  let xml = new XML(response);

  try {
    return new XMLList(xml.get("item"));

  } catch (err) {
    return null;
  
  }


}

async function itemQuery(titleId: string) : Promise<XML> {

  const itemEndpoint = `${baseURL}thing?id=${titleId}`;

  const itemOpts : req.Options = {
    uri         : itemEndpoint,
    encoding    : "utf-8",
    method      : "GET",
    headers     : {
      "Content-Type" : "application/json"
    }
  };

  let response : string = await req.get(itemOpts) ;
  let xml = new XML(response);

  return new XML(xml.get("item").at(0));

}


const bgg =
  new BGG(name, desc, help, async (msg, args) => {

    var result : RichEmbed | string = `Didn't find anything by ${args.join(" ")}`;

    const query = args.join("+");

    try {


      let searchPayload = await searchQuery(query);

      if (searchPayload === null || searchPayload.size() == 0) return result;

      let parsedPayload = await itemQuery(searchPayload.at(0).getProperty("id"));

      result = parse(parsedPayload);

    } catch (err) {

      logger.error(`${(<Error>err).stack}`)
      return (<Error>err).message;
    
    }

    return result;

  });

module.exports = bgg;
