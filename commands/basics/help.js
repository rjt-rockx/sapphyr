var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");
module.exports = class HelpCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "help",
			description: "Gives help for a command.",
			group: "basics",
			memberName: "help",
			args: [
				{
					key: "command",
					prompt: "Command to get help for.",
					type: "command",
					default: "all"
				}
			]
		});
	}

	async task({ client, args, message }) {
		if (args.command === "all") {
			let commands = client.registry.commands.array().map(command => {
				return { name: client.commandPrefix + command.name, value: command.description };
			});
			return message.channel.send({ embed: { fields: commands } });
		}
		let command = args.command;
		return message.channel.send({ embed: { title: client.commandPrefix + command.name, description: command.description } });
	}
};
