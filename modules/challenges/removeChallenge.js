const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class RemoveChallenge extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "removechallenge",
			description: "Remove a challenge with a given id.",
			group: "challenges",
			memberName: "removechallenge",
			aliases: ["rch"],
			userPermissions: ["ADMINISTRATOR"],
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
		let { challenges } = await ctx.db.get("challengeData");
		if (!challenges || (Array.isArray(challenges) && challenges.length < 1))
			return ctx.send("No challenges found.");
		if (ctx.args.id < 0 || !challenges.some(challenge => challenge.id === ctx.args.id))
			return ctx.send("Invalid ID specified.");
		const [challenge] = challenges.filter(({ id }) => ctx.args.id === id);
		if (!challenge)
			return ctx.send("No challenge found.");
		challenges = challenges.filter(({ id }) => id !== ctx.args.id);
		await ctx.db.set("challengeData", { challenges });
		ctx.embed({
			fields: [
				{
					name: `Challenge #${challenge.id} removed!`,
					value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
				},
				{
					name: "Challenge is currently inactive.",
					value: "You won't be rewarded for this challenge."
				}
			],
			footer: { text: `ID: ${challenge.id}` },
			timestamp: challenge.timestamp
		});
	}
};
