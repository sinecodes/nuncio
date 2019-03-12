

import { Message, Guild, Role, Collection, PermissionResolvable, GuildMember } from "discord.js";
import { CommandDefinition, CommandCallback} from "../definitions";
import { appLogger as logger } from "../logging";
import { DEFAULT_EXCLUDED_PERMISSIONS } from "../structs";


const name  = "role";
const desc  = "";
const help  = `
\`\`\`
Simple role system management that takes role ranks (order) and permissions into account.

There are certain permissions (like managing roles or muting/deafening members) that forbid
assigning yourself a role. You won't be able to do it either if you don't have at least a role
with a higher order than the one you're aiming for.

Usage:
role {rolename}     - Assign/Unassign role
\`\`\`
`;

class GuildRole extends CommandDefinition {
}

async function hasExcludedPerms(role : Role) : Promise<boolean> {
  return role.hasPermission(<PermissionResolvable>DEFAULT_EXCLUDED_PERMISSIONS);
}


async function userIsAboveRoleRank(user: GuildMember, targetRole : Role) : Promise<boolean> {

  // TODO test this one with a supposedly unprivileged user attempting to assign theirselves
  // a role with higher rank than their highest ranked role.
  const roleCandidate : Role | null = user.roles.find( (role, snowflake) => {
    return role.position > targetRole.position;
  });

  return (roleCandidate !== null);
}


async function userHasRole(member : GuildMember, role : Role) : Promise<boolean> {

  const roleCandidate : Role | null = member.roles.find( (userRole, snowflake) => { 
    return userRole.name === role.name; 
  });

  return (roleCandidate !== null);

}

async function ex(msg : Message, args : string[]): Promise<string> {

  const arg       = args.join(" ");
  const member    = msg.member;
  const guild     = msg.guild;
  let response    = "";

  const role : Role = guild.roles.find( (role, snowflake) => { return role.name === arg; });

  try {

    if (await hasExcludedPerms(role)) {
      return "You can't do that; ask a moderator to assign you a privileged role."
    
    } else {

      if (await userHasRole(member, role)) {

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

const role = new GuildRole(name, desc, help, ex);

module.exports = role;
