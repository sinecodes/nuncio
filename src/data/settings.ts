
import * as Winston from "winston";
import { Pool } from "pg";
import { IHandyRedis, createHandyClient } from "handy-redis";

const sillyConsole =
  new Winston.transports.Console({level: "silly", stderrLevels: ["error"]});

const settingsTableName  = "server_settings";

class SettingsRepo {

  private pool   : Pool;
  private redis  : IHandyRedis
  private logger :  Winston.Logger;

  constructor() {

    if ( process.env.HEROKU_POSTGRESQL_BRONZE_URL === undefined )
      throw new Error("No DB connection string provided.");

    if ( process.env.REDIS_URL === undefined )
      throw new Error("No redis connection string provided.");

    this.setUpLogger();

    this.setUpPG();
    this.setUpRedis();

  }

  async getServerTz(guildId: string) : Promise<number | undefined> {

    const cached : number | null = await this.cachedServerTz(guildId);
    if ( cached !== null ) return cached;

    const dbResult : number | null = await this.getDBServerTz(guildId);
    if ( dbResult !== null && !isNaN(dbResult) ) return dbResult;

    return undefined;

  }

  private async getDBServerTz(guildId: string) : Promise<number | null> {

    const client = await this.pool.connect();
    let result : number | null = null;
    
    const query = {

      name: "get-tz",
      text: `SELECT tz FROM ${settingsTableName} WHERE guildId=$1`,
      values: [ guildId ]
    
    };

    try {

      const queryResult = await client.query(query);
      console.log(queryResult.rows[0]);
      console.log(typeof(queryResult.rows[0]));
      result = Number(queryResult.rows[0]["tz"]);
      console.log(result);
    
    } catch (e) {
      this.logger.error((<Error>e).message);
    
    } finally {
      client.release();
    
    }

    return result;

  }

  private async cachedServerTz(guildId: string) : Promise<number | null> {

    let cachedStr  = await this.redis.hget(guildId, "tz");

    return (cachedStr === null && !isNaN(Number(cachedStr))) 
    ? null 
    : Number(cachedStr);
  
  }



  private setUpLogger() {
  
    this.logger = Winston.createLogger({
      level  : "error",
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
        app  : "SettingsRepo"
      }
    });

  }

  private setUpPG() {

    this.pool = new Pool({
      connectionString : process.env.HEROKU_POSTGRESQL_BRONZE_URL
    });

    this.pool.on('error', (err, client) => {
      this.logger.error(err.message);
    });

  }

  private setUpRedis() {
  
    const opts = {};

    opts["url"] = process.env.REDIS_URL;

    opts["retry_strategy"] = 
      function (options : any) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
            return undefined;
        }

        return Math.min(options.attempt * 100, 3000);

      };


    this.redis = createHandyClient(opts);

  }

}

export { SettingsRepo };
