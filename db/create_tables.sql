
CREATE TABLE IF NOT EXISTS public.fixed (
  
  _id       SERIAL PRIMARY KEY,
  ts        TIMESTAMP,
  userId    varchar(20),
  channelId varchar(20),
  guildId   varchar(20),
  msg       varchar(400)

);

CREATE TABLE IF NOT EXISTS public.cyclic (
  
  _id       SERIAL PRIMARY KEY,
  dayNo     int,
  userId    varchar(20),
  guildId   varchar(20),
  channelId varchar(20),
  time      TIMESTAMP,
  msg       varchar(400)

);

CREATE TABLE IF NOT EXISTS public.server_settings (

  _id     SERIAL PRIMARY KEY,
  guildId varchar(20),
  tz      smallint

);
