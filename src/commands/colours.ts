

import { Message, Guild, Role, GuildMember, PermissionResolvable } from "discord.js";
import { CommandDefinition } from "../definitions";
import { appLogger as logger } from "../logging";
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

class Colour extends CommandDefinition {
}


function isRoleAColour(role: Role, roleColour: string) : boolean {
  return role.name === roleColour &&
    role.hexColor === COLOURS.get(role.name);
}

async function createColourInGuild(guild: Guild, roleName: string) : Promise<Role | null> {

  const roleCandidate = guild.roles.find( (role, snowflake) => {
    return isRoleAColour(role, roleName);
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

async function getRole(guild : Guild, roleName : string) : Promise<Role> {

  return await guild.roles.find(
    (role, snowflake) => {
      return isRoleAColour(role, roleName);
    }
  );

}

async function cleanColoursFromMember(member: GuildMember) {

  member.roles.forEach( (role, snowflake) => {
    if (isRoleAColour(role, role.name))
      member.removeRole(role);
  });

}

async function ex(msg : Message, args : string[]): Promise<string> {

  const arg       = (args[0]).toLowerCase();
  const member    = msg.member;
  const guild     = msg.guild;
  let response    = `Which color is *${arg}*?`;

  try {

    if (COLOURS.has(arg)) {

      const matchedRole : Role = (member.roles).find(
        (role, snowflake) => { 
          return isRoleAColour(role, arg);
        }
      );

      if (!matchedRole) {

        await cleanColoursFromMember(member);
        const role = await getRole(guild, arg);

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
          if (COLOURS.has(role.name.toLowerCase()) && isRoleAColour)
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
          await createColourInGuild(guild, key);
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

const colour = new Colour(name, desc, help, ex);

module.exports = colour;
