module.exports = class SetChallengeRewardCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "setchallengereward",
			memberName: "setchallengereward",
			aliases: ["scr"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES"],
			group: "challenges",
			description: "Set a challenge reward for one of 3 difficulties.",
			args: [
				{
					key: "difficulty",
					prompt: "Easy/Medium/Hard",
					type: "string",
					oneOf: ["easy", "medium", "hard"]
				},
				{
					key: "amount",
					prompt: "Amount to reward to challenge difficulty.",
					type: "integer"
				}
			]
		});
	}
	async task(ctx) {
		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", { rewards: {} });
		if (!challengeData.rewards) challengeData.rewards = {};
		challengeData.rewards[ctx.args.difficulty] = ctx.args.amount;
		await ctx.db.set("challengeData", challengeData);
		return ctx.send("Successfully set challenge reward.");
	}
};
