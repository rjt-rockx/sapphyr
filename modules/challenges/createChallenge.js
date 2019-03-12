const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class CreateChallengeCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "createchallenge",
			description: "Create a challenge for this guild. Stores the challenge and returns its ID for future reference. Can only be created by people with the approver role.",
			group: "challenges",
			memberName: "createchallenge",
			aliases: ["crch"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "difficulty",
					prompt: "Difficulty of the challenge",
					type: "string"
				},
				{
					key: "challenge",
					prompt: "Description of the challenge",
					type: "string"
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
		if (!Object.keys(challengeData.rewards).includes(ctx.args.difficulty.toLowerCase()))
			return ctx.send("No reward specified for this difficulty.");
		if (ctx.args.challenge.length > 250)
			return ctx.send("Challenge text length too long. Please specify a smaller challenge.");
		if (!challengeData.challenges)
			challengeData.challenges = [];
		if (!challengeData.previousId)
			challengeData.previousId = challengeData.challenges.length;
		challengeData.previousId += 1;
		const timestamp = Date.now(), id = challengeData.previousId;
		challengeData.challenges.push({
			id,
			challenge: ctx.args.challenge,
			difficulty: ctx.args.difficulty.toLowerCase(),
			reward: challengeData.rewards[ctx.args.difficulty.toLowerCase()],
			enabled: true,
			timestamp
		});
		await ctx.db.set("challengeData", challengeData);
		ctx.embed({
			fields: [
				{
					name: `Challenge #${id} created!`,
					value: `[${toTitleCase(ctx.args.difficulty)}] ${ctx.args.challenge}`
				},
				{
					name: "Challenge is currently active.",
					value: `Reward: ${challengeData.rewards[ctx.args.difficulty.toLowerCase()]}`
				}
			],
			footer: { text: `ID: ${id}` },
			timestamp
		});
	}
};
