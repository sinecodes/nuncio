

import { Message, RichEmbed, Collection} from "discord.js";


declare type CommandCallback =
  (message : Message, args : string[]) => Promise<string | RichEmbed>;

interface CommandDefinition {

  name        : string;
  description : string;
  help        : string | RichEmbed;
  cooldown    : number;

  execute (msg: Message, args: string[]) : Promise<string | RichEmbed>

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
