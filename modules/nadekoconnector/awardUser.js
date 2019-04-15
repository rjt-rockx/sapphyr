module.exports = class AwardUserCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "awarduser",
			description: "Awards a certain amount of currency to a user.",
			group: "nadekoconnector",
			memberName: "awarduser",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "user",
					prompt: "User to award currency to.",
					type: "user"
				},
				{
					key: "amount",
					prompt: "Amount of currency to award.",
					type: "integer"
				},
				{
					key: "reason",
					prompt: "Reason to award the currency.",
					type: "string"
				}
			]
		});
	}

	async task(ctx) {
		if (!ctx.nadekoConnector)
			return ctx.send("NadekoConnector configuration not set.");
		const botInfo = await ctx.nadekoConnector.getBotInfo();
		if (typeof botInfo.currency.sign === "undefined")
			return ctx.send("Unable to parse NadekoConnector information.");
		if (!ctx.args.reason)
			return ctx.send("No reason specified.");
		ctx.args.reason = `[Sapphyr] Awarded by: ${ctx.message.author} | ${ctx.args.reason}`;
		if (!ctx.args.amount)
			return ctx.send("Invalid amount specified.");
		const response = await ctx.nadekoConnector[`${ctx.args.amount > 0 ? "add" : "subtract"}Currency`](ctx.args.user.id, ctx.args.amount, ctx.args.reason);
		if (response.error)
			return ctx.send(response.message);
		if (!response.error) {
			await ctx.send(`Successfully awarded ${ctx.args.amount} ${botInfo.currency.sign} to ${ctx.args.user.tag}`);
			return ctx.dm(`You've been awarded ${ctx.args.amount} ${botInfo.currency.sign} by ${ctx.user.tag}!`);
		}
	}
};
