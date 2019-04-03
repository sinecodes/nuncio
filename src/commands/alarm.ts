
import { Message, RichEmbed } from "discord.js";
import * as Winston from "winston";

import { CommandDefinition } from "../definitions";
import { AlarmRepo } from '../data/datetime';
import { SettingsRepo } from '../data/settings';
import { DEFAULT_COOLDOWN } from '../constants';

const sillyConsole =
  new Winston.transports.Console({level: "silly", stderrLevels: ["error"]});

const name = "alarm";
const desc = "";
const help = "";

class Time {

  hours     : number;
  minutes   : number;
  dayNumber : number;

  constructor(_hours: number, _minutes: number, _dayNumber: number) {

    this.hours     = _hours;
    this.minutes   = _minutes;
    this.dayNumber = _dayNumber;
  
  }

  public toString() : string { return `${this.hours}:${this.minutes}`; }

}

class ParseDatePayload {

  date      : Date | Time | null;
  reason    : string | null;
  eMsg      : string;
  success   : boolean;
  userId    : string;
  guildId   : string;
  channelId : string;

  constructor(

    _date      : Date | Time | null,
    _reason    : string | null,
    _eMsg      : string,
    _success   : boolean,
    _userId    : string,
    _guildId   : string,
    _channelId : string,

  ) {

    this.date      = _date;
    this.eMsg      = _eMsg;
    this.reason    = _reason;
    this.success   = _success;
    this.userId    = _userId;
    this.guildId   = _guildId;
    this.channelId = _channelId;
  
  }

  static newValid(

    _date      : Date | Time,
    _reason    : string,
    _userId    : string,
    _guildId   : string,
    _channelId : string

  ) : ParseDatePayload {
    return new ParseDatePayload(_date, _reason, "", true, _userId, _guildId, _channelId);
  }

  static newInvalid(_eMsg: string) : ParseDatePayload {
    return new ParseDatePayload(null, null, _eMsg, false, "", "", "");
  
  }

}

class Alarm implements CommandDefinition {

  private natural : string[];
  private cycle   : string[];
  private weekday : string[];

  private reasonMaxLength : number;
  private hourRegexp      : RegExp;
  private ddmmRegexp      : RegExp;


  private logger : Winston.Logger;

  name        : string;
  description : string;
  help        : string | RichEmbed;
  cooldown    : number;
  alarmRepo   : AlarmRepo;
  settingsRepo: SettingsRepo;

  constructor (

    _name        : string,
    _description : string,
    _help        : string | RichEmbed,
    _cooldown    : number,
    _alarmRepo   : AlarmRepo,
    _settingsRepo: SettingsRepo
  
  ) {

    this.name        = _name;
    this.description = _description;
    this.help        = _help;
    this.cooldown    = _cooldown;
    this.alarmRepo   = _alarmRepo;
    this.settingsRepo= _settingsRepo;

    this.setUp();
    this.setUpLogger();

  
  }

  private setUp() : void {

    this.reasonMaxLength = 400;

    this.natural = [
      "this",
      "next",
    ];

    this.cycle = [
      "every",
      "each",
    ]

    this.weekday = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    
    this.hourRegexp = 
      new RegExp("^([0-1]?[0-9]|2[0-4])[:|.]([0-5][0-9])(:[0-5][0-9])?$");

    this.ddmmRegexp = 
      new RegExp("^([1-9]|[0-2][0-9]|(3)[0-1])(\/|-)(((0)[0-9])|((1)[0-2]))$");

  }
  
  async execute(msg: Message, args: string[]) : Promise<string | RichEmbed> {

    const cmd = args.shift();

    if ( (cmd !== "set") && (cmd !== "unset") ) {
      return "Do you want to `set` or `unset` an alarm? Use `help alarm` for more information."

    } else if (cmd === "set") {
      return await this.newAlarm(msg, args);

    } else if (cmd === "unset") {
      return await this.removeAlarm(msg, args);

    } else {
      return "asdasd";  // XXX: make messages more user-friendly
    
    }

  }

  private async newAlarm(msg : Message, args : string[]): Promise<string> {  

    this.logger.silly(`New alarm request: ${args.join(' ')}`);

    const parsedResult : ParseDatePayload = await this.parseSetArgs(msg, args);

    this.logger.silly(`Parsed as ${JSON.stringify(parsedResult)}`);

    let isPersisted = false;

    if ( parsedResult.success ) isPersisted = await this.persist(parsedResult);
    else return parsedResult.eMsg;

    if ( isPersisted ) return "Alarm set";
    else return "Something went wrong when saving the alarm.";

  }

  private async persist(data : ParseDatePayload) : Promise<boolean> {

    let result = false;

    if ( data.date instanceof Time ) {

      const time   = data.date as Time;
      const reason = (data.reason === null) ? "" : data.reason;

      const unix = new Date(0);

      unix.setUTCHours(unix.getUTCHours() + time.hours);
      unix.setUTCMinutes(unix.getUTCMinutes() + time.minutes);

      result = await this.alarmRepo.createCyclic(
        time.dayNumber,
        data.userId,
        data.guildId,
        data.channelId,
        unix,
        reason
      );
    
    } else {

      const date = data.date as Date;
      const reason = (data.reason === null) ? "" : data.reason;

      result = await this.alarmRepo.createFixed(
        date,
        data.userId,
        data.guildId,
        data.channelId, 
        reason
      );
    
    }

    return result;
  
  }

  private async addOffset(hourMinute: number[], guildId: string) : Promise<number[]> {

    const offset = await this.settingsRepo.getServerTz(guildId);
    let result : number[] = [];
    
    if ( offset !== undefined ) {

      result[0] = Number(hourMinute[0]) + Number(offset);
      result[1] = hourMinute[1];

    }

    return result;

  }

  private async removeAlarm(msg : Message, args : string[]): Promise<string> {
    // XXX implement
    return "";
  }

  private async parseSetArgs(msg: Message, args: string[])
    : Promise<ParseDatePayload> {

    let date : Date;

    const defaultErrorMsg = 
      `Error serializing; use \`?help ${this.name}\` to read about correct formats.`;

    const timezoneNotSetErrorMsg = 
      `This server doesn't currently have a timezone set. Ask an admin to modify server settings using \`server set\` command.`;


    const utcnow     = new Date();
    const isThisWeek = ( this.natural.indexOf(args[0]) === 0 );
    const isCycle    = ( args[0] in this.cycle );
    const dayNumber  = this.weekday.indexOf(args[1]);
    const today      = utcnow.getDay();

    const ddmmMatch = this.ddmmRegexp.exec(args[0]);
    const isDDMM = (ddmmMatch === null) ? false : ddmmMatch.length !== 0;

    const timeArgPos   = isDDMM ? 1 : 2;
    const reasonArgPos = timeArgPos + 1;


    const timeMatch  = this.hourRegexp.exec(args[timeArgPos]);
    if ( timeMatch === null ) return ParseDatePayload.newInvalid(defaultErrorMsg);

    let timeMatchArray = timeMatch[0].split(".");
    if ( timeMatchArray.length === 1 ) timeMatchArray = timeMatch[0].split(":"); 
    let hourMinute : number[] = [];

    try {
      hourMinute = timeMatchArray as unknown as number[];
    
    } catch (e) {
      return ParseDatePayload.newInvalid(defaultErrorMsg);

    }

    hourMinute = await this.addOffset(hourMinute, msg.guild.id);
    if ( hourMinute.length === 0 ) return ParseDatePayload.newInvalid(timezoneNotSetErrorMsg);

    const unparsedReason = args.slice(reasonArgPos, args.length).join(' ');
    const reason = await this.parseReason(unparsedReason);

    this.logger.silly(
      `natural/cycle:${isThisWeek}/${isCycle} | day:${dayNumber} | time:${hourMinute} | ${reason}`
    );

    if (reason.length > this.reasonMaxLength) return ParseDatePayload.newInvalid(defaultErrorMsg);

    if ( isDDMM ) {

      if ( ddmmMatch === null ) return ParseDatePayload.newInvalid(defaultErrorMsg);

      this.logger.debug(`Alarm request parsed as DDMM.`);

      let ddmmMatchArrray = ddmmMatch[0].split("-");
      if ( ddmmMatchArrray.length === 1 ) ddmmMatchArrray = ddmmMatchArrray[0].split("/"); 
      let ddmm : number[] = [];

      try {
        ddmm = ddmmMatchArrray as unknown as number[];
      
      } catch (e) {
        return ParseDatePayload.newInvalid(defaultErrorMsg);

      }

      date =
        new Date(utcnow.getTime());


      date.setUTCDate(ddmm[0]);
      date.setUTCMonth(ddmm[1]);
      date.setUTCHours(hourMinute[0]);
      date.setUTCMinutes(hourMinute[1]);

      return ParseDatePayload.newValid(
        date, 
        reason, 
        msg.author.id, 
        msg.guild.id, 
        msg.channel.id
      );

    } else if (isCycle) {

      this.logger.debug(`Alarm request parsed as cycle.`);

      const time = new Time(hourMinute[0], hourMinute[1], dayNumber);

      return ParseDatePayload.newValid(
        time, 
        reason, 
        msg.author.id, 
        msg.guild.id, 
        msg.channel.id
      );

    } else if ( isThisWeek ) {

      if (  today > dayNumber ) return ParseDatePayload.newInvalid(defaultErrorMsg);

      date =
        new Date(utcnow.setTime( utcnow.getTime() + ((dayNumber - today)*24)*3600*1000));

      date.setUTCHours(hourMinute[0]);
      date.setUTCMinutes(hourMinute[1]);

      this.logger.debug(`Alarm request parsed as fixed in current week.`);

      return ParseDatePayload.newValid(
        date, 
        reason, 
        msg.author.id, 
        msg.guild.id, 
        msg.channel.id
      );

    } else if ( !isCycle  && !isThisWeek ){

      date =
        new Date(utcnow.setTime( utcnow.getTime() + ((dayNumber - today)*24)*3600*1000));

      const daysToAdd = ( (6 - today) + dayNumber + 1 );

      date.setUTCHours(hourMinute[0]);
      date.setUTCDate(date.getUTCDate() + daysToAdd);
      date.setUTCMinutes(hourMinute[1]);

      this.logger.debug(`Alarm request parsed as fixed in next week.`);
      return ParseDatePayload.newValid(date, reason, msg.author.id, msg.guild.id, msg.channel.id);

    } else {
      return ParseDatePayload.newInvalid(defaultErrorMsg);

    }

  }


  private async parseReason(reason : string) : Promise<string> {

    return reason;  // XXX lol

  }

  private setUpLogger() {
  
    this.logger = Winston.createLogger({
      level  : "silly",
      levels : Winston.config.npm.levels,
      format : Winston.format.combine(
        Winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        Winston.format.json()
      ),
      transports : [
        sillyConsole,
      ],
      defaultMeta : {
        uuid : Math.random().toString(30),
        app  : "AlarmCommand"
      }
    });

  }

}


const alarm = new Alarm(
  name,
  desc,
  help, 
  DEFAULT_COOLDOWN,
  new AlarmRepo(),
  new SettingsRepo()
);

module.exports = alarm;
