const { Util: { escapeMarkdown } } = require("discord.js");
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const chunk = (a, l) => a.length === 0 ? [] : [a.slice(0, l)].concat(chunk(a.slice(l), l));

module.exports = class HelpCommand extends global.utils.baseCommand {
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

	task({ args, message, channel, user }) {
		if (args.command === "all") {
			const fieldPaginator = global.utils.fieldPaginator;
			const commands = this.client.registry.commands.array().sort((a, b) => a.name.localeCompare(b.name)).map(command => {
				const commandData = getCommandData(command, this.client);
				return { name: commandData.name, value: commandData.description };
			});
			const fields = chunk(commands, 5);
			return new fieldPaginator(channel, user, fields, 15);
		}
		const commandData = getCommandData(args.command, this.client);
		const fields = [];
		if (commandData.arguments.length > 0) fields.push({ name: "Arguments", value: commandData.arguments });
		if (commandData.userperms.length > 0) fields.push({ name: "Required User Permissions", value: commandData.userperms });
		return message.channel.send({ embed: { title: commandData.name, description: commandData.description, fields } });
	}
};


function getCommandData(command, client) {
	let commandName = client.commandPrefix + command.name;
	if (Array.isArray(command.aliases) && command.aliases.length > 0) {
		const aliases = [];
		aliases.push(escapeMarkdown(commandName));
		command.aliases.map(alias => aliases.push(escapeMarkdown(client.commandPrefix + alias)));
		commandName = aliases.join(" / ");
	}
	let arguments = [];
	if (command.argsCollector && command.argsCollector.args && Array.isArray(command.argsCollector.args)) {
		const argKeys = command.argsCollector.args.map(arg => {
			const argName = (arg.oneOf && arg.oneOf.length < 4) ? arg.oneOf.join("/") : arg.key;
			return `${arg.default ? `[${argName}]` : `<${argName}>`}`;
		});
		commandName += ` ${argKeys.join(" ")}`;
		arguments = command.argsCollector.args.map(arg => `**${toTitleCase(arg.key)}** - ${arg.prompt} ${arg.default ? `(Default: ${arg.default})` : ""}`).join("\n");
	}
	let userperms = [];
	if (Array.isArray(command.userPermissions) && command.userPermissions.length > 0)
		userperms = command.userPermissions.map(permission => toTitleCase(permission.split("_").join(" "))).join("\n");
	return {
		name: commandName,
		arguments,
		userperms,
		description: command.description
	};
}