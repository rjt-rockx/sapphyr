const { Util: { escapeMarkdown } } = require("discord.js");
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));

module.exports = class Help extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "help",
			description: "Gives help for a command.",
			group: "basics",
			memberName: "help",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
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

	task({ args, message, channel, user, guild }) {
		if (args.command === "all") {
			const fieldPaginator = global.utils.fieldPaginator;
			const commands = this.client.registry.commands.array().sort((a, b) => a.name.localeCompare(b.name)).map(command => {
				const commandData = getCommandData(command, this.client, guild);
				return { name: commandData.name, value: commandData.description };
			});
			return new fieldPaginator(channel, user, commands, 15, {
				embedTemplate: { title: "List of commands:" }
			});
		}
		const commandData = getCommandData(args.command, this.client, guild);
		const fields = [];
		if (commandData.aliases)
			fields.push({ name: "Aliases", value: commandData.aliases });
		if (commandData.arguments)
			fields.push({ name: "Arguments", value: commandData.arguments });
		if (commandData.userperms)
			fields.push({ name: "Required User Permissions", value: commandData.userperms });
		if (commandData.clientperms)
			fields.push({ name: "Required Bot Permissions", value: commandData.clientperms });
		return message.channel.send({ embed: { title: commandData.name, description: commandData.description, fields } });
	}
};


function getCommandData(command, client, guild) {
	let commandTitle = escapeMarkdown((guild.commandPrefix || client.commandPrefix) + command.name), arguments = [];
	if (command.argsCollector && command.argsCollector.args && Array.isArray(command.argsCollector.args)) {
		const argKeys = command.argsCollector.args.map(arg => {
			const argName = (arg.oneOf && arg.oneOf.length < 4) ? arg.oneOf.join("/") : arg.key;
			return `${typeof arg.default !== "undefined" && arg.default !== null ? `[${argName}]` : `<${argName}>`}`;
		});
		commandTitle += ` ${argKeys.join(" ")}`;
		arguments = command.argsCollector.args.map(arg => `**${toTitleCase(arg.key)}** - ${arg.prompt} ${typeof arg.default !== "undefined" && arg.default !== null ? `(Default: ${arg.default})` : ""}`).join("\n");
	}
	let userperms = "";
	if (Array.isArray(command.userPermissions) && command.userPermissions.length > 0)
		userperms = command.userPermissions.map(permission => toTitleCase(permission.split("_").join(" ").toLowerCase())).join(", ");
	let clientperms = "";
	if (Array.isArray(command.clientPermissions) && command.clientPermissions.length > 0)
		clientperms = command.clientPermissions.map(permission => toTitleCase(permission.split("_").join(" ").toLowerCase())).join(", ");
	return {
		name: commandTitle,
		aliases: Array.isArray(command.aliases) ? command.aliases.map(alias => escapeMarkdown((guild.commandPrefix || client.commandPrefix) + alias)).join(", ") : "",
		description: command.description,
		arguments, userperms, clientperms
	};
}