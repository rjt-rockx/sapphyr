module.exports = class DenyCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "deny",
			memberName: "deny",
			aliases: ["denychallenge", "dch"],
			group: "challenges",
			description: "Deny a challenge.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the message to grab.",
					type: "string"
				}
			]
		});
	}
	async task(ctx) {
		const noApprover = new RichEmbed()
			.setTitle("Missing Approver")
			.setColor("#7959ff")
			.setDescription("You need to have role: `Challenge Approver` to do this."),
			role = ctx.message.guild.roles.find("name", "Challenge Approver");
		if (!ctx.message.member.roles.has(role.id))
			return ctx.send(noApprover);
		if (!ctx.args.id) return;
		const appTch = this.client.channels.get("455252710732595211");
		const message = await appTch.fetchMessage(ctx.args.id),
			embed = new RichEmbed()
				.setTitle("Denied.")
				.setColor("#7959ff")
				.setDescription("Your challenge submission has been denied.");
		await message.delete();
		await message.author.send(embed);
		const success = new RichEmbed()
			.setTitle("Success.")
			.setDescription("Challenge Denied")
			.setColor("#7959ff")
			.addField("Denied by:", ctx.message.author)
			.addField("Submitter:", message.author)
			.addField("Challenge:", message.content)
			.addField("Money Rewarded:", "False")
			.setTimestamp();
		return ctx.send(success);
	}
};
