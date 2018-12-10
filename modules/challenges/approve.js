const { RichEmbed } = require("discord.js");
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

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
					type: "integer"
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

		const { challenges } = challengeData;
		if (!challenges || (Array.isArray(challenges) && challenges.length < 1))
			return ctx.send("No challenges found.");
		if (ctx.args.challengeId < 0 || !challenges.some(challenge => challenge.id === ctx.args.challengeId))
			return ctx.send("Invalid ID specified.");
		const [challenge] = challenges.filter(({ id }) => ctx.args.challengeId === id);
		if (!challenge)
			return ctx.send("No challenge found.");
		if (!challenge.enabled)
			return ctx.send("This challenge is currently disabled.");

		if (!challengeData[submission.author.id])
			challengeData[submission.author.id] = [];
		if (!ctx.nadekoConnector)
			return ctx.send("No NadekoConnector configuration found for this guild.");

		const { bot: { currency: { sign } } } = await ctx.nadekoConnector.getBotInfo();
		const result = await ctx.nadekoConnector.addCurrency(submission.author.id, challenge.reward, `[Sapphyr] Challenge #${challenge.id} approved by ${ctx.user.tag} (${ctx.user.id}) in ${ctx.guild.name} (${ctx.guild.id})`);
		if (result.error) {
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to award currency to the user.");
		}

		const timestamp = Date.now();
		challengeData[submission.author.id].push({
			id: challenge.id,
			approver: ctx.user.id,
			timestamp
		});

		await ctx.db.set("challengeData", challengeData);
		await submission.author.send(new RichEmbed({
			title: "Your submission was approved!",
			fields: [
				{
					name: `Challenge #${challenge.id}`,
					value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
				},
				{
					name: `Challenge approved by ${ctx.user.tag} (${ctx.user.id}).`,
					value: `You were rewarded with ${challenge.reward} ${sign}!`
				}
			],
			footer: { text: `Submission ID: ${submission.id}` },
			timestamp
		}));
		return ctx.send("Challenge submission successfully approved.");
	}
};
