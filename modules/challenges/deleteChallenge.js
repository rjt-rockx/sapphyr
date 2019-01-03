const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class RemoveChallenge extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "deletechallenge",
			description: "Delete a challenge with a given id.",
			group: "challenges",
			memberName: "deletechallenge",
			aliases: ["delch"],
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
		const challengeData = await ctx.db.get("challengeData");
		if (!challengeData.challenges || (Array.isArray(challengeData.challenges) && challengeData.challenges.length < 1))
			return ctx.send("No challenges found.");
		if (ctx.args.id < 0 || !challengeData.challenges.some(challenge => challenge.id === ctx.args.id))
			return ctx.send("Invalid ID specified.");
		const [challenge] = challengeData.challenges.filter(({ id }) => ctx.args.id === id);
		if (!challenge)
			return ctx.send("No challenge found.");
		challengeData.challenges = challengeData.challenges.filter(({ id }) => id !== ctx.args.id);
		await ctx.db.set("challengeData", challengeData);
		ctx.embed({
			fields: [
				{
					name: `Challenge #${challenge.id} successfully deleted.`,
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
