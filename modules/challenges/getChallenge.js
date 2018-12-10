const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class GetChallengeCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "getchallenge",
			description: "Get a challenge with a given id.",
			group: "challenges",
			memberName: "getchallenge",
			aliases: ["gch"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "The ID of the challenge",
					type: "integer"
				}
			]
		});
	}

	async task(ctx) {
		const { challenges } = await ctx.db.get("challengeData");
		if (!challenges || (Array.isArray(challenges) && challenges.length < 1))
			return ctx.send("No challenges found.");
		if (ctx.args.id < 0 || !challenges.some(challenge => challenge.id === ctx.args.id))
			return ctx.send("Invalid ID specified.");
		const [challenge] = challenges.filter(({ id }) => ctx.args.id === id);
		if (!challenge)
			return ctx.send("No challenge found.");
		ctx.embed({
			fields: [
				{
					name: `Challenge #${challenge.id}`,
					value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
				},
				{
					name: `Challenge is currently ${challenge.enabled ? "active" : "inactive"}.`,
					value: challenge.enabled ? "You won't be rewarded for this challenge." : `Reward: ${challenge.reward}`
				}
			],
			footer: { text: `ID: ${challenge.id}` },
			timestamp: challenge.timestamp
		});
	}
};
