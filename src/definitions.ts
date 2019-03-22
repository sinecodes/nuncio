

import { Message, RichEmbed, Collection} from "discord.js";


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

declare type CommandOpt = CommandDefinition | undefined;
declare type StringOpt  = string | undefined;
declare type Timestamps = Collection<string, number>;
declare type Cooldowns  = Collection<string, Timestamps>
declare type Commands   = Collection<string, CommandDefinition>;



export {

  CommandDefinition,
  CommandCallback,
  Alert,
  CommandOpt,
  StringOpt,
  Commands,
  Cooldowns,
  Timestamps

};
