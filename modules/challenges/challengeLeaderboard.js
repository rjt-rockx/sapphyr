const sum = arr => arr.reduce((a, b) => a + b, 0);

module.exports = class ChallengeLeaderboard extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "challengeleaderboard",
			memberName: "challengeleaderboard",
			aliases: ["chlb"],
			group: "challenges",
			description: "See this guild's challenge leaderboard",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			guildOnly: true,
			args: [
				{
					key: "sortBy",
					prompt: "Method to sort the challenge leaderboard by",
					type: "string",
					oneOf: ["count", "reward"],
					default: "count"
				}
			]
		});
	}

	async task(ctx) {
		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", {});
		if (typeof challengeData.users !== "object") {
			challengeData.users = {};
			await ctx.db.set("challengeData", challengeData);
		}

		if (!ctx.nadekoConnector)
			return ctx.send("No NadekoConnector configuration found for this guild.");

		const result = await ctx.nadekoConnector.getBotInfo();
		if (result.error) {
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to get bot information.");
		}

		const sign = result.currency.sign;
		const leaderboard = this.getLeaderboard(challengeData, ctx.args.sortBy);
		if (!leaderboard || (Array.isArray(leaderboard) && leaderboard.length < 1))
			return ctx.send("Unable to fetch leaderboard.");

		const leaderboardFields = leaderboard.map(user => ({
			name: `#${user.rank} - ${this.client.users.get(user.userId).tag}`,
			value: `${user.count} challenges completed.\n${user.reward} ${sign} earned.`
		}));

		return new global.utils.fieldPaginator(ctx.channel, ctx.user, leaderboardFields, 15, {
			embedTemplate: { title: `Challenge leaderboard for ${ctx.guild.name}` },
			chunkSize: 7
		});
	}

	getLeaderboard(challengeData, sortBy = "count") {
		let leaderboard = [];
		for (const [userId, challengeHistory] of Object.entries(challengeData.users)) {
			if (this.client.users.has(userId))
				leaderboard.push({
					userId,
					count: challengeHistory.length,
					reward: sum(challengeHistory.map(entry => entry.challenge.reward))
				});
		}
		leaderboard = leaderboard.sort((a, b) => b.reward - a.reward);
		if (sortBy === "count")
			leaderboard = leaderboard.sort((a, b) => b.count - a.count || b.reward - a.reward);
		return leaderboard.map((element, index) => ({ ...element, rank: index + 1 }));
	}
};