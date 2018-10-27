var path = require("path");
var config = require("./localdata/config.json");
var commando = require("discord.js-commando");
var { initializeServices, removeServices, services } = require("./services");
var utils = require("./utils");

var client = new commando.Client({
	owner: config.bot.owners,
	commandEditableDuration: 0,
	nonCommandEditable: false,
	unknownCommandResponse: false,
	commandPrefix: "_"
});

client
	.on("ready", async () => {
		console.log(`Logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		client.user.setActivity("with sapphires!");
		// Initialize datahandler
		client.datahandler = new utils.datahandler();
		await client.datahandler.initialize();
		console.log("Datahandler initialized.");
		// Initialize services
		await initializeServices(client);
		console.log("Services initialized.");
		// Attach to global object
		global.services = services;
		global.utils = utils;
		console.log("Global variables initialized.");
		// Register commands, groups and types
		client.registry.registerDefaultTypes();
		console.log("Default types initialized.");
		client.registry.registerDefaultGroups();
		console.log("Default groups initialized.");
		client.registry.registerGroups([
			["basics", "basic commands"],
			["fun", "fun commands"],
			["utils", "utility commands"]
		]);
		console.log("Command groups initialized.");
		client.registry.registerCommandsIn(path.join(__dirname, "commands"));
		console.log("Commands initialized.");
	})
	.on("commandError", (cmd, err) => {
		if (err instanceof commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on("commandBlocked", (msg, reason) => {
		console.log(`Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ""} blocked. ${reason}`);
	})
	.on("commandPrefixChange", (guild, prefix) => {
		console.log(`Prefix ${prefix === "" ? "removed" : `changed to ${prefix || "the default"}`} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
	})
	.on("commandStatusChange", (guild, command, enabled) => {
		console.log(`Command ${command.groupID}:${command.memberName} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
	})
	.on("groupStatusChange", (guild, group, enabled) => {
		console.log(`Group ${group.id} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.`);
	});

client.login(config.bot.token);