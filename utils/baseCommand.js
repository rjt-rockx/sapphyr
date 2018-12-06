const { Command } = require("discord.js-commando"),
	datahandler = require("./datahandler.js"),
	guildDatahandler = require("./guildDatahandler.js"),
	globalDatahandler = require("./globalDatahandler.js"),
	nadekoConnector = require("./nadekoConnector.js"),
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
			prefix: this.client.commandPrefix,
			channel: message.channel,
			user: message.author,
			react: (...data) => message.react(...data),
			dm: (...data) => message.author.send(...data),
			dmEmbed: data => message.author.send({ embed: data }),
			send: (...data) => message.channel.send(...data),
			embed: data => message.channel.send({ embed: data }),
			selfDestruct: (data, seconds = 10) => message.channel.send(data).then(msg => msg.delete(seconds * 1000))
		};
		if (message.guild)
			context.guild = message.guild;
		if (message.member)
			context.member = message.member;
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
