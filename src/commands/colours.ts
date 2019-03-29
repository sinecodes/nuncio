

import { Message, RichEmbed, Guild, Role, GuildMember, PermissionResolvable } from "discord.js";
import { CommandDefinition } from "../definitions";
import { appLogger as logger } from "../logging";
import { DEFAULT_COOLDOWN } from "../constants";
import { PERMISSIONS, COLOURS } from "../structs";


const name  = "color";
const desc  = "";
const help  = `
\`\`\`
Colored roles system. They are all mutually exclusive; you can only have one at a given time.

Usage:
color create    - create all available colors
color delete    - delete colors
color {color}   - assign/unassign yourself a color
\`\`\`
`;

class Colour implements CommandDefinition {

  name        : string;
  description : string;
  help        : string | RichEmbed;
  cooldown    : number;

  constructor (

    _name        : string,
    _description : string,
    _help        : string | RichEmbed,
    _cooldown    : number
  
  ) {

    this.name        = _name;
    this.description = _description;
    this.help        = _help;
    this.cooldown    = _cooldown;
  
  }

  async execute (msg: Message, args: string[]) : Promise<string | RichEmbed>{

    const arg       = (args[0]).toLowerCase();
    const member    = msg.member;
    const guild     = msg.guild;
    let response    = `Which color is *${arg}*?`;

    try {

      if (COLOURS.has(arg)) {

        const matchedRole : Role = (member.roles).find(
          (role, snowflake) => { 
            return this.isRoleAColour(role, arg);
          }
        );

        if (!matchedRole) {

          await this.cleanColoursFromMember(member);
          const role = await this.getRole(guild, arg);

          if (role) {

            member.addRole(role);
            response = `You're now ${arg}!`;
          
          } else {
            response = "Ask a mod to initialize the colour system first.";

          }

        
        } else {

          member.removeRole(matchedRole);
          response = `Color reverted!`;

        }

      } else if (arg === "delete" || arg === "clean") {


        const isMemberAllowed = msg.member.permissions.has(
          PERMISSIONS.get("manage_roles") as PermissionResolvable
        );

        if (isMemberAllowed){

          guild.roles.array().forEach( (role : Role) => {
            if (COLOURS.has(role.name.toLowerCase()) && this.isRoleAColour)
              role.delete();
          });

          response = "Everything cleaned up.";

        } else {
          response = "You're not allowed to do that";
        }

      } else if (arg === "create") {

        const isMemberAllowed = msg.member.permissions.has(
          PERMISSIONS.get("manage_roles") as PermissionResolvable
        );

        if (isMemberAllowed) {

          COLOURS.forEach(async (hexString, key) => {
            await this.createColourInGuild(guild, key);
          });

          response = "Roles created.";

        } else {
          response = "You're not allowed to do that";
        
        }
      }

    } catch(err) {

      logger.error(<Error>err.stack);

      response = "I can't do that; do I have the required permissions?";

    }

    return response;

  }

  private isRoleAColour(role: Role, roleColour: string) : boolean {
    return role.name === roleColour &&
      role.hexColor === COLOURS.get(role.name);
  }

  private async createColourInGuild(guild: Guild, roleName: string) : Promise<Role | null> {

    const roleCandidate = guild.roles.find( (role, snowflake) => {
      return this.isRoleAColour(role, roleName);
    });

    if (roleCandidate !== null) 
      return null;

    return await guild.createRole({

      name    : roleName,
      color   : COLOURS.get(roleName),
      hoist   : false,

      mentionable : false

    });

  }

  private async getRole(guild : Guild, roleName : string) : Promise<Role> {

    return await guild.roles.find(
      (role, snowflake) => {
        return this.isRoleAColour(role, roleName);
      }
    );

  }

  private async cleanColoursFromMember(member: GuildMember) {

    member.roles.forEach( (role, snowflake) => {
      if (this.isRoleAColour(role, role.name))
        member.removeRole(role);
    });

  }

}

const colour = new Colour(name, desc, help, DEFAULT_COOLDOWN);
module.exports = colour;
