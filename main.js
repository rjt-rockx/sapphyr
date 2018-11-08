var path = require("path");
var config = require("./localdata/config.js");
var commando = require("discord.js-commando");
var { initializeServices, removeServices, services } = require("./services");
var utils = require("./utils");
const log = require("fancy-log");

var client = new commando.Client({
	owner: config.owners,
	commandEditableDuration: 0,
	nonCommandEditable: false,
	unknownCommandResponse: false,
	commandPrefix: "_"
});

try {
	client
		.on("ready", async () => {
			log(`Logged in as ${client.user.tag} (${client.user.id})`);
			client.user.setActivity("with sapphires!");
			// Initialize datahandler
			client.datahandler = new utils.datahandler();
			await client.datahandler.initialize();
			log("Datahandler initialized.");
			// Initialize services
			await initializeServices(client);
			log("Services initialized.");
			// Attach to global object
			global.services = services;
			global.utils = utils;
			log("Global variables initialized.");
			// Register modules, commands and argument types.
			client.registry.registerDefaultTypes();
			log("Default types initialized.");
			let { initializeModules } = require("./modules");
			await initializeModules(client);
			log("Modules initialized.");
		})
		.on("commandError", (cmd, err) => {
			if (err instanceof commando.FriendlyError) return;
			log.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
		})
		.on("commandBlocked", (msg, reason) => {
			log(`Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ""} blocked. ${reason}`);
		})
		.on("commandPrefixChange", (guild, prefix) => {
			log(`Prefix ${prefix === "" ? "removed" : `changed to ${prefix || "the default"}`} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
		})
		.on("commandStatusChange", (guild, command, enabled) => {
			log(`Command ${command.groupID}:${command.memberName} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
		})
		.on("groupStatusChange", (guild, group, enabled) => {
			log(`Group ${group.id} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.`);
		});
}
catch (err) {
	log.error(err);
}

client.login(config.token);
