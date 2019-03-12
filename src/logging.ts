

import * as Winston from "winston";
import * as cfg from "../config.json";

const sillyConsole =
  new Winston.transports.Console({level: "silly", stderrLevels: ["error"]});

const sillyFile =
  new Winston.transports.File({level: "silly", filename : "app.log"});


const appLogger = Winston.createLogger({
  level       : cfg.log_level,
  levels      : Winston.config.npm.levels,
  format      : Winston.format.combine(
    Winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
    Winston.format.json()
  ),
  transports  : [
    sillyConsole,
    sillyFile
  ],
  defaultMeta : {
    uuid    : Math.random().toString(30),
    app     : "bot"
  }
});

export { appLogger };
