const { RichEmbed } = require("discord.js");

module.exports = class ApproveCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "approve",
			memberName: "approve",
			group: "challenges",
			description: "Approve a challenge and award the submitter.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "The ID of the message to grab.",
					type: "string"
				},
				{
					key: "difficulty",
					prompt: "The difficulty of the challenge.",
					type: "string",
					oneOf: ["easy", "medium", "hard"]
				}
			]
		});
	}
	async task(ctx) {
		const botInfo = await ctx.nadekoConnector.getBotInfo(),
			noApprover = new RichEmbed()
				.setTitle("Missing Approver")
				.setColor("#7959ff")
				.setDescription("You need to have role: `Challenge Approver` to do this."),
			role = ctx.message.guild.roles.find(rolee => rolee.name === "Challenge Approver");
		if (!ctx.message.member.roles.has(role.id)) return ctx.send(noApprover);
		if (!ctx.args.id) return;
		const appTch = this.client.channels.get("455252710732595211"),
			message = await appTch.fetchMessage(ctx.args.id),
			rewardAmount = await ctx.db.get(`challenges/${ctx.args.difficulty}`),
			approved = new RichEmbed()
				.setTitle("Challenge Approved!")
				.addField("Challenge Approved By:", ctx.message.author)
				.addField("Challenge:", message.content)
				.addField("Submitter:", message.author)
				.addField("Difficulty:", ctx.args.difficulty)
				.addField("Money Rewarded:", `${rewardAmount} ${botInfo.bot.currency.sign}`)
				.setColor("#7959ff")
				.setTimestamp(),
			approved2 = new RichEmbed()
				.setTitle("Challenge Approved")
				.setDescription("Your challenge has been approved.")
				.addField("Challenge:", message.content)
				.addField("Submitter:", "You")
				.addField("Difficulty:", ctx.args.difficulty)
				.addField("Money Rewarded:", `${rewardAmount} ${botInfo.bot.currency.sign}`)
				.setColor("#7959ff")
				.setTimestamp();
		await message.delete();
		await message.author.send(approved2);
		await this.client.channels.get("507667784285552640").send(approved);
		const reason = `[Sapphyr Challenges] ${ctx.message.author} approved ${ctx.args.id} with amount: ${rewardAmount}${botInfo.bot.currency.sign}`;
		return ctx.nadekoConnector.addCurrency(message.author.id, rewardAmount, reason);
	}
};
