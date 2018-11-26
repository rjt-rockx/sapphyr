const { RichEmbed } = require("discord.js");
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
		const noReason = new RichEmbed().setTitle("Missing Arguments").setColor("#7959ff")
			.setDescription("Please provide a reason for the award.");

		if (!ctx.nadekoConnector) return ctx.send("NadekoConnector configuration not set.");
		const botInfo = await ctx.nadekoConnector.getBotInfo();
		if (typeof botInfo.bot.currency.sign === "undefined") return ctx.send("Unable to parse NadekoConnector information.");
		if (!ctx.args.reason) return ctx.send(noReason);
		const dmReason = ctx.args.reason;
		ctx.args.reason = `[Sapphyr] Awarded by: ${ctx.message.author} | ${ctx.args.reason}`;
		if (ctx.args.amount === 0) return;
		let response = null;
		if (ctx.args.amount < 0) response = await ctx.nadekoConnector.subtractCurrency(ctx.args.user.id, ctx.args.amount, ctx.args.reason);
		if (ctx.args.amount > 0) response = await ctx.nadekoConnector.addCurrency(ctx.args.user.id, ctx.args.amount, ctx.args.reason);
		if (typeof response.error !== "undefined") return ctx.send(response.message);
		if (typeof response.error === "undefined") {
			const Success = new RichEmbed().setTitle("Success").setColor("#7959ff")
				.setDescription(`Successfully awarded ${ctx.args.amount} ${botInfo.bot.currency.sign} to ${ctx.args.user.username}`);
			await ctx.send(Success);
			const embed = new RichEmbed().setTitle("Award").setColor("#7959ff")
				.setDescription(`You've been awarded ${ctx.args.amount} ${botInfo.bot.currency.sign} by ${ctx.message.author.tag} with reason ${dmReason}.`);
			return ctx.args.user.send(embed);
		}
	}
};
