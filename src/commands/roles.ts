

import { Message, RichEmbed, Role, PermissionResolvable, GuildMember } from "discord.js";
import { CommandDefinition } from "../definitions";
import { appLogger as logger } from "../logging";
import { DEFAULT_COOLDOWN } from "../constants";
import { DEFAULT_EXCLUDED_PERMISSIONS } from "../structs";


const name  = "role";
const desc  = "";
const help  = `
\`\`\`
Simple role system management that takes role ranks (order) and permissions into account.

There are certain permissions (like managing roles or muting/deafening members) that forbid
assigning yourself a role. You won't be able to do it either if you don't have at least a role
with a higher order than the one you're aiming for (order can be modified by moderators).

Usage:
role {rolename}     - Assign/Unassign role
\`\`\`
`;

class GuildRole implements CommandDefinition {

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

  private async hasExcludedPerms(role : Role) : Promise<boolean> {
    return role.hasPermission(<PermissionResolvable>DEFAULT_EXCLUDED_PERMISSIONS);
  }


  private async userIsAboveRoleRank(user: GuildMember, roleToAssign : Role) : Promise<boolean> {

    const roleCandidate : Role | null = user.roles.find( (userRole, snowflake) => {
      return userRole.position > roleToAssign.position;
    });

    return (roleCandidate !== null || user.roles.size !== 1);

  }


  private async userHasRole(member : GuildMember, role : Role) : Promise<boolean> {

    const roleCandidate : Role | null = member.roles.find( (userRole, snowflake) => { 
      return userRole.name === role.name; 
    });

    return (roleCandidate !== null);

  }

  async execute(msg : Message, args : string[]): Promise<string | RichEmbed> {

    const arg       = args.join(" ");
    const member    = msg.member;
    const guild     = msg.guild;
    let response    = "";

    const role : Role = guild.roles.find( (role, snowflake) => { return role.name === arg; });
    if  (role === null) return `No role found by ${arg}.`;

    try {

      if (await this.hasExcludedPerms(role) || await this.userIsAboveRoleRank(member, role)) {
        return "You can't do that; ask a moderator to assign you a privileged role."
      
      } else {

        if (await this.userHasRole(member, role)) {

          member.removeRole(role);
          response = `Role "${role.name}" removed.`

        } else {

          member.addRole(role);
          response = `Role "${role.name}" added.`

        }
    
      }

    } catch (err) {

      logger.error(<Error>err.stack);

      response = "I can't do that; do I have the required permissions?";

    }

    return response;

  }

}

const role = new GuildRole(name, desc, help, DEFAULT_COOLDOWN);

module.exports = role;
