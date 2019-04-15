const { RichEmbed } = require("discord.js");

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
					prompt: "Role to award",
					type: "role"
				},
				{
					key: "amount",
					prompt: "Amount of currency to award",
					type: "integer"
				},
				{
					key: "reason",
					prompt: "Reason to award the currency",
					type: "string",
					default: "No reason specified."
				}
			]
		});
	}
	async task(ctx) {
		const result = await ctx.nadekoConnector.getBotInfo();
		if (result.error)
			return ctx.send("Invalid NadekoConnector configuration stored.");
		if (!ctx.args.amount)
			return ctx.send("Invalid amount specified.");
		ctx.args.reason = `[Sapphyr] Awarded by ${ctx.user} | ${ctx.args.reason}`;
		let count = 0;
		for (const [userId, member] of ctx.args.role.members) {
			const response = await ctx.nadekoConnector[`${ctx.args.amount > 0 ? "add" : "subtract"}Currency`](userId, ctx.args.amount, ctx.args.reason);
			count++;
			if (response.error)
				return ctx.send(`Unable to ${ctx.args.amount > 0 ? "add" : "subtract"} currency for members of this role.`);
			member.user.send(new RichEmbed({
				title: `${Math.abs(ctx.args.amount)} ${result.currency.sign} has been ${ctx.args.amount > 0 ? "added to" : "subtracted from"} your balance.`,
				description: `Transaction by ${ctx.user.tag} for having ${ctx.args.role.name} in ${ctx.guild.name}`,
				fields: [{
					name: "Reason",
					value: ctx.args.reason
				}]
			}));
		}
		return ctx.send(`Successfully ${ctx.args.amount > 0 ? "added" : "subtracted"} ${ctx.args.amount} ${result.currency.sign} ${ctx.args.amount > 0 ? "to" : "from"} ${count} members with the ${ctx.args.role.name} role.`);
	}
};
