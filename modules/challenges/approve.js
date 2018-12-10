module.exports = class ApproveCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "approve",
			memberName: "approve",
			aliases: ["approvechallenge", "ach"],
			group: "challenges",
			description: "Approve a challenge and award the submitter.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			guildOnly: true,
			args: [
				{
					key: "messageId",
					prompt: "The ID of the submission message to approve.",
					type: "string"
				},
				{
					key: "challengeId",
					prompt: "The ID of the challenge to approve.",
					type: "number"
				}
			]
		});
	}
	async task(ctx) {
		const { approverRole, approverChannel } = await ctx.db.get();
		if (!approverRole)
			return ctx.send(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		if (!approverChannel)
			return ctx.send(`Approver channel not specified. Please specify an approver channel using ${ctx.prefix}approverChannel`);
		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			return ctx.send("Approver role not found.");
		}
		if (!ctx.guild.channels.has(approverChannel)) {
			await ctx.db.set("approverChannel", "");
			return ctx.send("Approver channel not found.");
		}
		if (ctx.channel.id !== approverChannel)
			return ctx.send(`This command can only be used in #${ctx.guild.channels.get(approverChannel).name}`);
		if (!ctx.member.roles.has(approverRole))
			return ctx.send(`You need the ${ctx.guild.roles.get(approverRole).name} to use this command.`);

		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", {});
		let submission;
		try {
			submission = await ctx.channel.fetchMessage(ctx.args.messageId);
		}
		catch (error) {
			return ctx.send("Unable to fetch the message. Make sure the message exists in this channel.");
		}
		if (!challengeData[submission.author.id])
			challengeData[submission.author.id] = [];
		if (!challengeData.rewards)
			return ctx.send("No challenge rewards specified for this guild.");
		if (!ctx.nadekoConnector)
			return ctx.send("No NadekoConnector configuration found for this guild.");

		ctx.send("wooot all checks passed");
	}
};
