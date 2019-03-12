import { PermissionResolvable } from "discord.js";

const PERMISSIONS = new Map<string, PermissionResolvable>([
  ["administrator", "ADMINISTRATOR"],
  ["create_instant_invite", "CREATE_INSTANT_INVITE"],
  ["kick_members", "KICK_MEMBERS"],
  ["ban_members", "BAN_MEMBERS"],
  ["manage_channels", "MANAGE_CHANNELS"],
  ["manage_guild", "MANAGE_GUILD"],
  ["add_reactions", "ADD_REACTIONS"],
  ["view_audit_log", "VIEW_AUDIT_LOG"],
  ["priority_speaker", "PRIORITY_SPEAKER"],
  ["view_channel", "VIEW_CHANNEL"],
  ["read_messages", "READ_MESSAGES"],
  ["send_messages", "SEND_MESSAGES"],
  ["send_tts_messages", "SEND_TTS_MESSAGES"],
  ["manage_messages", "MANAGE_MESSAGES"],
  ["embed_links", "EMBED_LINKS"],
  ["attach_files", "ATTACH_FILES"],
  ["read_message_history", "READ_MESSAGE_HISTORY"],
  ["mention_everyone", "MENTION_EVERYONE"],
  ["use_external_emojis", "USE_EXTERNAL_EMOJIS"],
  ["external_emojis", "EXTERNAL_EMOJIS"],
  ["connect", "CONNECT"],
  ["speak", "SPEAK"],
  ["mute_members", "MUTE_MEMBERS"],
  ["deafen_members", "DEAFEN_MEMBERS"],
  ["move_members", "MOVE_MEMBERS"],
  ["use_vad", "USE_VAD"],
  ["change_nickname", "CHANGE_NICKNAME"],
  ["manage_nicknames", "MANAGE_NICKNAMES"],
  ["manage_roles", "MANAGE_ROLES"],
  ["manage_webhooks", "MANAGE_WEBHOOKS"],
  ["manage_emojis", "MANAGE_EMOJIS"]
]);

const DEFAULT_EXCLUDED_PERMISSIONS : PermissionResolvable[] = [
  "ADMINISTRATOR",
  "CREATE_INSTANT_INVITE",
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "MANAGE_CHANNELS",
  "MANAGE_GUILD",
  "VIEW_AUDIT_LOG",
  "PRIORITY_SPEAKER",
  "MANAGE_MESSAGES",
  "MENTION_EVERYONE",
  "MUTE_MEMBERS",
  "DEAFEN_MEMBERS",
  "MOVE_MEMBERS",
  "MANAGE_NICKNAMES",
  "MANAGE_ROLES",
  "MANAGE_WEBHOOKS",
  "MANAGE_EMOJIS"
];

const DEFAULT_PERMISSIONS : PermissionResolvable = [
  "CREATE_INSTANT_INVITE",
  "ADD_REACTIONS",
  "VIEW_CHANNEL",
  "READ_MESSAGES",
  "SEND_MESSAGES",
  "MANAGE_MESSAGES",
  "EMBED_LINKS",
  "ATTACH_FILES",
  "READ_MESSAGE_HISTORY",
  "USE_EXTERNAL_EMOJIS",
  "CONNECT",
  "SPEAK",
  "CHANGE_NICKNAME"
];

const COLOURS = new Map<string, string>([
  ["red",     "#cc241d"],
  ["green",   "#98971a"],
  ["yellow",  "#d79921"],
  ["blue",    "#458588"],
  ["purple",  "#b16286"],
  ["aqua",    "#689d6a"],
  ["orange",  "#d65d0e"],
  ["white",   "#fbf1c7"]
]);

export { PERMISSIONS, DEFAULT_PERMISSIONS, COLOURS, DEFAULT_EXCLUDED_PERMISSIONS };
