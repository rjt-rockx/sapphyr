const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class EnableChallengeCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "enablechallenge",
			description: "Enable a challenge with a given id.",
			group: "challenges",
			memberName: "enablechallenge",
			aliases: ["enablech"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the challenge",
					type: "integer"
				}
			]
		});
	}

	async task(ctx) {
		const approverRole = await ctx.db.get("approverRole");
		if (!approverRole)
			return ctx.send(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			return ctx.send("Approver role not found.");
		}
		if (!ctx.member.roles.has(approverRole))
			return ctx.send(`You need the ${ctx.guild.roles.get(approverRole).name} to use this command.`);
		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", { rewards: {} });
		if (!challengeData.challenges || (Array.isArray(challengeData.challenges) && challengeData.challenges.length < 1))
			return ctx.send("No challenge found.");
		if (ctx.args.id < 0 || !challengeData.challenges.some(challenge => challenge.id === ctx.args.id))
			return ctx.send("Invalid ID specified.");
		const index = challengeData.challenges.findIndex(({ id }) => ctx.args.id === id);
		challengeData.challenges[index].enabled = true;
		const challenge = challengeData.challenges[index];
		await ctx.db.set("challengeData", challengeData);
		return ctx.embed({
			fields: [
				{
					name: `Challenge #${challenge.id} successfully enabled.`,
					value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
				},
				{
					name: `Challenge is currently ${challenge.enabled ? "active" : "inactive"}.`,
					value: !challenge.enabled ? "You won't be rewarded for this challenge." : `Reward: ${challenge.reward}`
				}
			],
			footer: { text: `ID: ${challenge.id}` },
			timestamp: challenge.timestamp
		});
	}
};
