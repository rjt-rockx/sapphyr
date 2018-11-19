const { Util: { escapeMarkdown } } = require("discord.js");
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

	async task({ client, args, message, channel, user }) {
		if (args.command === "all") {
			let fieldPaginator = global.utils.fieldPaginator;
			let commands = client.registry.commands.array().map(command => {
				let commandData = getCommandData(command, client);
				return { name: commandData.name, value: commandData.description };
			});
			let fields = chunk(commands, 5);
			return new fieldPaginator(channel, user, fields, 30);
		}
		let commandData = getCommandData(args.command, client);
		let fields = [];
		if (commandData.arguments.length > 0)
			fields.push({ name: "Arguments", value: commandData.arguments });
		if (commandData.userperms.length > 0)
			fields.push({ name: "Required User Permissions", value: commandData.userperms });
		return message.channel.send({ embed: { title: commandData.name, description: commandData.description, fields: fields } });
	}
};


function getCommandData(command, client) {
	let commandName = client.commandPrefix + command.name;
	if (Array.isArray(command.aliases) && command.aliases.length > 0) {
		let aliases = [];
		aliases.push(escapeMarkdown(commandName));
		command.aliases.map(alias => aliases.push(escapeMarkdown(client.commandPrefix + alias)));
		commandName = aliases.join(" / ");
	}
	let arguments = [];
	if (command.argsCollector && command.argsCollector.args && Array.isArray(command.argsCollector.args)) {
		let argKeys = command.argsCollector.args.map(arg => {
			let argName = arg.key;
			if (arg.oneOf && arg.oneOf.length < 4) argName = arg.oneOf.join("/");
			return `${arg.default ? `[${argName}]` : `<${argName}>`}`;
		});
		commandName += " " + argKeys.join(" ");
		arguments = command.argsCollector.args.map(arg => `**${toTitleCase(arg.key)}** - ${arg.prompt} ${arg.default ? `(Default: ${arg.default})` : ""}`).join("\n");
	}
	let userperms = [];
	if (Array.isArray(command.userPermissions) && command.userPermissions.length > 0) {
		userperms = command.userPermissions.map(permission => toTitleCase(permission.split("_").join(" "))).join("\n");
	}
	return {
		name: commandName,
		arguments: arguments,
		userperms: userperms,
		description: command.description
	};
}

function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

function chunk(a, l) {
	if (a.length == 0) return [];
	else return [a.slice(0, l)].concat(chunk(a.slice(l), l));
}
