module.exports = class CashCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "cash",
			description: "Gets the currency balance of a user.",
			group: "nadekoconnector",
			memberName: "cash",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			aliases: ["$", "currency"],
			args: [
				{
					key: "user",
					prompt: "User to get the balance of",
					type: "user",
					default: "self"
				}
			]
		});
	}

	async task(ctx) {
		if (!ctx.nadekoConnector) return ctx.send("NadekoConnector configuration not set.");
		const result = await ctx.nadekoConnector.getBotInfo();
		if (result.error || !result.bot.currency.sign)
			return ctx.send("Unable to parse NadekoConnector information.");
		const targetUser = ctx.args.user === "self" ? ctx.message.author : ctx.args.user,
			currency = await ctx.nadekoConnector.getCurrency(targetUser.id);
		return ctx.embed({ description: `**${targetUser.tag}** has ${currency.currency} ${result.bot.currency.sign}` });
	}
};
