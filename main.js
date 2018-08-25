var path = require("path");
var sqlite = require("sqlite");
var config = require("./localdata/config.json");
var commando = require("discord.js-commando");

var client = new commando.Client({
  owner: config.owners,
  unknownCommandResponse: false,
  commandPrefix: "s."
});


client
  .on("error", console.error)
  .on("warn", console.warn)
  .on("debug", console.log)


  .on("ready", () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
  })


  .on("disconnect", () => { console.warn("Disconnected!"); })
  .on("reconnecting", () => { console.warn("Reconnecting..."); })


  .on("commandError", (cmd, err) => {
    if (err instanceof commando.FriendlyError) return;
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
  })


  .on("commandBlocked", (msg, reason) => {
    console.log(`Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ""}
			blocked; ${reason}
		`);
  })


  .on("commandPrefixChange", (guild, prefix) => {
    console.log(`Prefix ${prefix === "" ? "removed" : `changed to ${prefix || "the default"}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
  })


  .on("commandStatusChange", (guild, command, enabled) => {
    console.log(`Command ${command.groupID}:${command.memberName}
			${enabled ? "enabled" : "disabled"}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
  })


  .on("groupStatusChange", (guild, group, enabled) => {
    console.log(`Group ${group.id}
			${enabled ? "enabled" : "disabled"}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
  });

client.setProvider(
  sqlite.open(path.resolve("./localdata/sapphyr.db")).then(db => new commando.SQLiteProvider(db))
).catch(console.error);

client.registry
  .registerCommandsIn(path.resolve("./commands"));

client.login(config.bot.token);