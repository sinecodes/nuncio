

CREATE TABLE fixed (
  
  _id       SERIAL PRIMARY KEY,
  ts        TIMESTAMP,
  userId    varchar(20),
  channelId varchar(20),
  guildId   varchar(20),
  msg       varchar(400)

);

CREATE TABLE cyclic (
  
  _id       SERIAL PRIMARY KEY,
  dayNo     int,
  userId    varchar(20),
  guildId   varchar(20),
  channelId varchar(20),
  time      TIMESTAMP,
  msg       varchar(400)

);


