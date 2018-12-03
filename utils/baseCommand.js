const { Command } = require("discord.js-commando"),
	datahandler = require("./datahandler.js"), guildDatahandler = require("./guildDatahandler.js"),
	globalDatahandler = require("./globalDatahandler.js"), nadekoConnector = require("./nadekoConnector.js"),
	{ mongoUrl } = require("../localdata/config"),
	log = require("fancy-log");

module.exports = class BaseCommand extends Command {
	constructor(client, commandInfo) {
		super(client, commandInfo);
	}

	async run(message, args, fromPattern) {
		const context = {
			message, args, fromPattern,
			msg: message,
			arguments: args,
			channel: message.channel,
			user: message.author,
			react: message.react,
			dm: message.author.send,
			dmEmbed: data => message.author.send({ embed: data }),
			send: message.channel.send,
			embed: data => message.channel.send({ embed: data })
		};
		if (message.guild)
			context.guild = message.guild;
		if (typeof this.client.datahandler === "undefined") {
			this.client.datahandler = new datahandler(mongoUrl ? mongoUrl : undefined);
			await this.client.datahandler.initialize();
		}
		context.globalDb = new globalDatahandler(this.client.datahandler);
		if (context.guild && context.guild.id) {
			context.db = new guildDatahandler(this.client.datahandler, context.guild.id);
			const nc = await context.db.get("nadekoconnector");
			if (typeof nc === "object" && nc.enabled === true)
				context.nadekoConnector = new nadekoConnector(nc.address, nc.password);
		}
		await this.task(context);
		log(`Command ${message.command.name} was executed by user ${message.author.tag} (${message.author.id}).`);
	}
};
