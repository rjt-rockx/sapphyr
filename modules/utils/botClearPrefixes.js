const { RichEmbed } = require("discord.js");

module.exports = class BotClear extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "botclearprefixes",
			aliases: ["botclearprefix", "bcprefixes", "bcprefix"],
			group: "utils",
			memberName: "botclearprefixes",
			description: "Add, remove or list the prefixes configured for botclear.",
			args: [
				{
					key: "action",
					prompt: "Whether to add/remove/list prefixes",
					type: "string",
					oneOf: ["add", "remove", "list"]
				},
				{
					key: "prefix",
					prompt: "Prefix to add/remove",
					type: "string",
					default: ""
				}
			],
			clientPermissions: [
				"READ_MESSAGE_HISTORY",
				"MANAGE_MESSAGES"
			],
			userPermissions: ["ADMINISTRATOR"]
		});
	}

	async task(ctx) {
		let prefixes = await ctx.db.get("botPrefixes") || await ctx.db.set("botPrefixes", []);
		if (ctx.args.action === "add") {
			if (!ctx.args.prefix)
				return ctx.send("Invalid prefix specified.");
			if (prefixes.includes(ctx.args.prefix.toLowerCase()))
				return ctx.send("The given botclear prefix already exists.");
			prefixes = [...new Set([...prefixes, ctx.args.prefix.toLowerCase()])];
			await ctx.db.set("botPrefixes", prefixes);
			return ctx.embed({
				title: `Prefix ${ctx.args.prefix.toLowerCase()} successfully added.`,
				fields: [
					{
						name: `Current botclear prefixes (${prefixes.length})`,
						value: prefixes.length > 0 ? prefixes.map(prefix => `\`${prefix}\``).join(", ") : "No botclear prefixes exist."
					}
				]
			});
		}
		else if (ctx.args.action === "remove") {
			if (!ctx.args.prefix)
				return ctx.send("Invalid prefix specified.");
			if (!prefixes.includes(ctx.args.prefix.toLowerCase()))
				return ctx.send("The given botclear prefix does not exist.");
			prefixes = prefixes.filter(p => p !== ctx.args.prefix.toLowerCase());
			prefixes = [...new Set(prefixes)];
			await ctx.db.set("botPrefixes", prefixes);
			return ctx.embed({
				title: `Prefix ${ctx.args.prefix.toLowerCase()} successfully removed.`,
				fields: [
					{
						name: `Current botclear prefixes (${prefixes.length})`,
						value: prefixes.length > 0 ? prefixes.map(prefix => `\`${prefix}\``).join(", ") : "No botclear prefixes exist."
					}
				]
			});
		}
		else if (ctx.args.action === "list") {
			return ctx.embed({
				fields: [
					{
						name: `Current botclear prefixes (${prefixes.length})`,
						value: prefixes.length > 0 ? prefixes.map(prefix => `\`${prefix}\``).join(", ") : "No botclear prefixes exist."
					}
				]
			});
		}
	}
};
