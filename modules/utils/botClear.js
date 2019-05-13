module.exports = class BotClear extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "botclear",
			aliases: ["bc"],
			group: "utils",
			memberName: "botclear",
			description: "Clear bot messages as well as messages starting with specific prefixes.",
			args: [
				{
					key: "amount",
					prompt: "Amount of messages to clear. (Max: 50)",
					type: "integer",
					default: 25
				},
				{
					key: "ignorepins",
					prompt: "Whether to ignore pinned messages or not.",
					type: "boolean",
					default: false
				}
			],
			clientPermissions: [
				"READ_MESSAGE_HISTORY",
				"MANAGE_MESSAGES"
			],
			userPermissions: ["MANAGE_MESSAGES"]
		});
	}

	async task(ctx) {
		if (ctx.args.amount > 50)
			return ctx.send("Cannot clear more than 50 messages at once.");
		const prefixes = await ctx.db.get("botPrefixes") || await ctx.db.set("botPrefixes", []);
		try {
			let messages = await ctx.channel.fetchMessages({ limit: ctx.args.amount, before: ctx.message.id });
			if (ctx.args.ignorepins)
				messages = messages.filter(message => !message.pinned);
			messages = messages.filter(message => message.author.bot || (prefixes.length > 0 && prefixes.some(prefix => message.cleanContent.toLowerCase().startsWith(prefix))));
			if (messages.length < 1)
				return ctx.selfDestruct("No bot messages were found.", 5);
			await ctx.message.delete().catch();
			await ctx.channel.bulkDelete(messages, true);
			return ctx.selfDestruct(`Deleted ${messages.size} bot messages in the last ${ctx.args.amount} messages.`, 5);
		}
		catch (error) {
			return ctx.send("Unable to delete messages.");
		}
	}
};
