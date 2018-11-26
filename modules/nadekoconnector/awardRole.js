const { RichEmbed } = require("discord.js"), log = require("fancy-log");

module.exports = class AwardRoleCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "awardrole",
			memberName: "awardrole",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			group: "nadekoconnector",
			description: "Award money to a role.",
			args: [
				{
					key: "role",
					prompt: "The role to award.",
					type: "string"
				},
				{
					key: "amount",
					prompt: "amount of currency to award.",
					type: "integer"
				},
				{
					key: "reason",
					prompt: "reason to award the currency.",
					type: "string"
				}
			]
		});
	}
	async task(ctx) {
		const botInfo = await ctx.nadekoConnector.getBotInfo();

		const missingroles = new RichEmbed()
			.setTitle("Missing role")
			.setColor("#7959ff")
			.setDescription("Missing role to award, the role is case sensitive.");
		const missingamount = new RichEmbed()
			.setTitle("Missing amount")
			.setColor("#7959ff")
			.setDescription("Missing amount to award.");
		const missingreason = new RichEmbed()
			.setTitle("Missing reason")
			.setColor("#7959ff")
			.setDescription("Missing reason to award");
		const nadekoError = new RichEmbed()
			.setTitle("Error with NadekoConnector");
		const successEmbed = new RichEmbed().setTitle("Success").setColor("#7959ff")
			.setDescription(`Successfully awarded ${ctx.args.amount} ${botInfo.bot.currency.sign} to role ${ctx.args.role}`);

		if (!ctx.message.guild.roles.find(role => role.name === ctx.args.role)) return ctx.send(missingroles);
		if (!ctx.args.amount) return ctx.send(missingamount);
		if (!ctx.args.reason) return ctx.send(missingreason);

		const role = ctx.message.guild.roles.find(r => r.name === ctx.args.role);
		ctx.args.reason = `[Sapphyr] Awarded by ${ctx.user} | ${ctx.args.reason}`;

		role.members.map(async member => {
			const embed = new RichEmbed();
			let response;

			if (ctx.args.amount < 0) {
				response = await ctx.nadekoConnector.subtractCurrency(member.id, ctx.args.amount, ctx.args.reason);
				if (response.error) return ctx.embed(nadekoError.setDescription(response.message));

				log(`Currency subtracted from role ${ctx.args.role} with reason ${ctx.args.reason}\n Currency added: ${ctx.args.amount}`);
				return embed.setTitle("Currency Removed")
					.setColor("#7959ff")
					.setDescription(`${ctx.args.amount} ${botInfo.bot.currency.sign} has been removed from your account by ${ctx.message.author.tag} with reason ${ctx.args.reason}.`);
			}
			if (ctx.args.amount > 0) {
				response = await ctx.nadekoConnector.addCurrency(member.id, ctx.args.amount, ctx.args.reason);
				if (response.error) return ctx.embed(nadekoError.setDescription(response.message));

				log(`Currency added to role ${ctx.args.role} with reason ${ctx.args.reason}\n Currency added: ${ctx.args.amount}`);
				return embed.setTitle("Currency Added")
					.setColor("#7959ff")
					.setDescription(`${ctx.args.amount} ${botInfo.bot.currency.sign} has been added to your account by ${ctx.message.author.tag} with reason ${ctx.args.reason}.`);
			}
			return member.send(embed);
		});
		return ctx.message.channel.send(successEmbed);
	}
};
