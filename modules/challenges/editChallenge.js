const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class EditChallengeCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "editchallenge",
			description: "Edit a challenge with a given id.",
			group: "challenges",
			memberName: "editchallenge",
			aliases: ["ech"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the challenge",
					type: "integer"
				},
				{
					key: "difficulty",
					prompt: "Difficulty of the challenge",
					type: "string",
					default: ""
				},
				{
					key: "challenge",
					prompt: "Description of the challenge",
					type: "string",
					default: ""
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
		if (!Object.keys(challengeData.rewards).includes(ctx.args.difficulty.toLowerCase()))
			return ctx.send("Invalid difficulty specified.");
		const index = challengeData.challenges.findIndex(({ id }) => ctx.args.id === id);
		const timestamp = Date.now();
		const oldChallenge = challengeData.challenges[index];
		const challenge = {
			id: oldChallenge.id,
			challenge: ctx.args.challenge || oldChallenge.challenge,
			difficulty: ctx.args.difficulty.toLowerCase() || oldChallenge.difficulty,
			reward: challengeData.rewards[ctx.args.difficulty.toLowerCase()] || oldChallenge.reward,
			enabled: oldChallenge.enabled,
			timestamp
		};
		challengeData.challenges[index] = challenge;
		await ctx.db.set("challengeData", challengeData);
		return ctx.embed({
			fields: [
				{
					name: `Challenge #${challenge.id} successfully edited.`,
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
