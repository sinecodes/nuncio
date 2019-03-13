
import { Collection } from "discord.js";
import * as fs from "fs";
import * as path from "path";

import { appLogger as logger } from "../logging";
import { CommandDefinition } from "../definitions";

const targetDir = path.join(__dirname, "../commands");
logger.silly(`Loading commands from ${targetDir}`);

const commandsCollection : Collection<string, CommandDefinition> = new Collection();
const commandFiles : string[] =
  fs.readdirSync(targetDir).filter(file => file.endsWith(".js"));

logger.silly(`Found ${commandFiles.length} command candidates.`);


for (const file of commandFiles) {

  const modulePath = path.join(targetDir, file);

  try {

    const cmd = <CommandDefinition>require(modulePath);
    commandsCollection.set(cmd.name.toLowerCase(), cmd);

  } catch (err) {
    logger.error(`${<Error>err.stack}`);

  }

}


export { commandsCollection };
