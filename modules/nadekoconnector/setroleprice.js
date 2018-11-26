const { RichEmbed } = require("discord.js");

module.exports = class SetRolePriceCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "setroleprice",
			memberName: "setroleprice",
			group: "nadekoconnector",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			description: "Set the global price for all the roles in the shop.",
			args: [{
				key: "price",
				prompt: "What do you want the price of the roles to be?",
				type: "integer"
			}]
		});
	}
	async task(ctx) {
		await ctx.db.set("roleprice", ctx.args.price);
		const botInfo = ctx.nadekoConnector.getBotInfo(),
			embed = new RichEmbed()
				.setTitle("Success")
				.setDescription(`Successfully set the role price to ${ctx.args.price}${botInfo.bot.currency.sign}`);
		return ctx.send(embed);
	}
};
