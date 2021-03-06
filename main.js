const { resolve } = require("path"),
	{ owners, db, token, prefix } = require("./localdata/config.js"),
	{ Client: commandoClient, FriendlyError } = require("discord.js-commando"),
	serviceHandler = require("./services"),
	utils = require("./utils"),
	log = require("fancy-log");

const client = new commandoClient({
	owner: owners,
	commandEditableDuration: 0,
	nonCommandEditable: false,
	unknownCommandResponse: false,
	commandPrefix: prefix
});

try {
	client
		.once("ready", async () => {
			log(`Logged in as ${client.user.tag} (${client.user.id})`);
			await client.user.setActivity("Logged in!");

			// Initialize datahandler
			if (db.type === "mongo")
				client.datahandler = new utils.datahandler(db);
			else if (db.type === "sqlite")
				client.datahandler = new utils.sqliteDatahandler(db);
			
			await client.datahandler.initialize(client);
			log("Datahandler initialized.");
			global.utils = utils;

			// Initialize services
			const services = new serviceHandler(client);
			services.initialize(resolve("./services/"));
			global.services = services;
			log("Services initialized.");

			// Initialize argument types
			client.registry.registerDefaultTypes();
			log("Argument Types initialized.");

			// Register modules
			const { initializeModules } = require("./modules");
			await initializeModules(client);
			log("Modules initialized.");

			// Set help activity
			log("Ready.");
			await client.user.setActivity(`Type ${client.commandPrefix}help for help!`);
		})
		.on("commandError", (command, err) => {
			if (err instanceof FriendlyError) return;
			log.error(`Error in command ${command.groupID}:${command.name}`, err);
		})
		.on("error", log.error);

	client.login(token);
} catch (err) {
	log.error(err);
}
