

import * as Winston from "winston";
import { Pool } from "pg";

const sillyConsole =
  new Winston.transports.Console({level: "silly", stderrLevels: ["error"]});

const fixedTableName  = "";
const cyclicTableName = "";

class AlarmRepo {

  private pool   : Pool;
  private logger :  Winston.Logger;

  constructor() {

    if ( process.env.HEROKU_POSTGRESQL_BRONZE_URL === undefined )
      throw new Error("No DB connection string provided.");

    this.setUpLogger();

    this.setUp();

  }

  async createCyclic(

    dayNo     : number,
    userId    : string,
    guildId   : string,
    channelId : string,
    time      : Date,
    reason    : string
  
  ) : Promise<boolean> {

    const client = await this.pool.connect();
    let isSuccess = false;
    
    const query = {

      name: "insert-cyclic",
      text: `INSERT INTO ${cyclicTableName} (dayNo, userId, guildId, channelId, time, reason) VALUES ($1, $2, $3, $4, $5)`,      values: [ dayNo, userId, guildId, channelId, time.toISOString(), reason ]
    
    };

    try {

      await client.query(query);
      isSuccess = true;
    
    } catch (e) {
      this.logger.error((<Error>e).message);
    
    } finally {
      client.release();
    
    }

    return isSuccess;

  }

  async createFixed(

    date      : Date,
    userId    : string,
    guildId   : string,
    channelId : string,
    msg       : string

  ) : Promise<boolean> {

    const client = await this.pool.connect();
    let isSuccess = false;

    const query = {

      name: "insert-fixed",
      text: `INSERT INTO ${fixedTableName} (ts, userId, guildId, channelId, msg) VALUES ($1, $2, $3, $4, $5)`,
      values: [date.toISOString(), userId, guildId, channelId, msg]
    
    };

    this.logger.debug(`Executing query: ${query.text} with values: ${query.values.join(', ')}`);

    try {

      await client.query(query);
      isSuccess = true;
    
    } catch (e) {
      this.logger.error((<Error>e).message);
    
    } finally {
      client.release();
    
    }

    return isSuccess;

  }

  async deleteLastFixedCreated(userId: number) : Promise <boolean> { 

    const client = await this.pool.connect();
    let isSuccess = false;

    const query = {

      name: "delete-fixed",
      text: `DELETE FROM ${fixedTableName} WHERE userId in ( SELECT FROM ${fixedTableName} WHERE userId=$1 ORDER BY Id DESC LIMIT 1 )`,
      values: [ userId ]
    
    };

    this.logger.debug(`Executing query: ${query.text} with values: ${query.values.join(', ')}`);

    try {

      await client.query(query);
      isSuccess = true;
    
    } catch (e){
      this.logger.error((<Error>e).message);
    
    } finally {
      client.release();
    
    }

    return isSuccess;

  }


  private setUpLogger() {
  
    this.logger = Winston.createLogger({
      level  : "info",
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
        app  : "AlarmRepo"
      }
    });

  }

  private setUp() {

    this.pool = new Pool({
      connectionString : process.env.HEROKU_POSTGRESQL_BRONZE_URL
    });

    this.pool.on('error', (err, client) => {
      this.logger.error(err.message);
    });

  }

}

export { AlarmRepo };
