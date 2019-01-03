const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class RemoveChallenge extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "removechallenge",
			description: "Remove the latest challenge entry of a particular challenge from a user.",
			group: "challenges",
			memberName: "removechallenge",
			aliases: ["rch"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the challenge.",
					type: "integer"
				},
				{
					key: "user",
					prompt: "User to remove the challenge ID from.",
					type: "user"
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
		const userId = ctx.args.user.id;
		if (!challengeData.users[userId])
			challengeData.users[userId] = [];
		const index = challengeData.users[userId].findIndex(entry => entry.challenge.id === ctx.args.id);
		if (index < 0) return ctx.send("No challenge entry found for the given user and challenge ID.");
		challengeData.users[userId].splice(index, 1);
		await ctx.db.set("challengeData", challengeData);
		return ctx.send("Challenge entry successfully removed from the given user.");
	}
};
