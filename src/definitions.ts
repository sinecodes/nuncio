

import { Message, RichEmbed } from "discord.js";


declare type CommandCallback =
  (message : Message, args : string[]) => Promise<string | RichEmbed>;

abstract class CommandDefinition {

  name        : string;
  description : string;
  help        : string | RichEmbed;
  cooldown    : number;
  execute     : CommandCallback;

  constructor(

    _name           : string,
    _description    : string,
    _help           : string | RichEmbed,
    _execute        : CommandCallback) {

    this.name           = _name;
    this.description    = _description;
    this.help           = _help;
    this.cooldown       = 3;
    this.execute        = _execute;

  }

}

interface Alert {

  guild       : string;
  channel     : string;
  reason      : string;
  date        : string;
  mentions    : string[];

}




export { CommandDefinition, CommandCallback, Alert };
