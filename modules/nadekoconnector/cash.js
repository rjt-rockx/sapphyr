const { RichEmbed } = require("discord.js");
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
		const botInfo = await ctx.nadekoConnector.getBotInfo();
		if (typeof botInfo.bot.currency.sign === "undefined") return ctx.send("Unable to parse NadekoConnector information.");
		const targetUser = ctx.args.user === "self" ? ctx.message.author : ctx.args.user,
			currency = await ctx.nadekoConnector.getCurrency(targetUser.id),
			embed = new RichEmbed()
				.setColor("#7959ff")
				.setDescription(`**${targetUser.tag}** has ${currency.currency} ${botInfo.bot.currency.sign}`);
		return ctx.send(embed);
	}
};
