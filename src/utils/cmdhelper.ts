
import { Collection } from "discord.js";
import { Cooldowns, CommandDefinition } from "../definitions";

function isCmdOnCooldown(
  cooldowns : Cooldowns,
  command   : CommandDefinition,
  userId    : string
) : string | null {

  const timestamps = cooldowns.get(command.name);
  const now  = Date.now();
  const cool = (command.cooldown || 5) * 1000;

  if ( timestamps === undefined )  {
    cooldowns.set(command.name, new Collection());

  } else if ( !(timestamps.has(userId)) )  {
    timestamps.set(userId, now);

  } else if (timestamps.has(userId))  {

    const timeOpt        = timestamps.get(userId);
    const expirationTime = timeOpt === undefined ? cool : timeOpt + cool;

    if (now < expirationTime) {

      const timeLeft = (expirationTime - now) / 1000;

      return `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`;

    } else {
      timestamps.delete(userId);

    }

  }

  return null;

}


export { isCmdOnCooldown };
