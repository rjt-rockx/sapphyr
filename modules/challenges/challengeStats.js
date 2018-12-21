const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const sum = arr => arr.length && arr.length === 0 ? 0 : arr.reduce((sum, value) => (typeof sum === "number" ? sum : 0) + value);

module.exports = class ChallengeStatsCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "challengestats",
			memberName: "challengestats",
			aliases: ["chstats"],
			group: "challenges",
			description: "Get challenge stats of a user.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			guildOnly: true,
			args: [
				{
					key: "user",
					prompt: "User to get the challenge stats of.",
					type: "user",
					default: "self"
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
		const { users } = challengeData;
		const user = ctx.args.user === "self" ? ctx.user : ctx.args.user;
		if (!Object.keys(users).includes(user.id))
			return ctx.send("No challenge data found.");
		if (!Array.isArray(users[user.id]))
			return ctx.send("Invalid challenge data stored.");
		if (users[user.id].length < 1)
			return ctx.send("No challenge history found!");
		const result = await ctx.nadekoConnector.getBotInfo();
		if (result.error) {
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to get bot information.");
		}
		const sign = result.bot.currency.sign;
		const challengeCount = this.parseChallengeHistory(challengeData, user.id);
		const rankInfo = this.getUserRank(challengeData, user.id);
		if (!rankInfo) return ctx.send("User not found!");
		let rankText = `Currently ranked at #${rankInfo.user.rank}.`;
		if (rankInfo.previousUser)
			rankText += `\n${rankInfo.previousUser.count - rankInfo.user.count} challenges to catch up to ${this.client.users.get(rankInfo.previousUser.userId).tag}`;
		return ctx.embed({
			title: `Challenge Stats of ${user.tag}`,
			description: rankText,
			thumbnail: { url: user.displayAvatarURL },
			fields: [
				{
					name: "Challenges Completed",
					value: Object.entries(challengeCount).map(([difficulty, { count }]) => `**${toTitleCase(difficulty)}:** ${count}`).join("\n"),
					inline: true
				},
				{
					name: "Rewards Gained",
					value: Object.entries(challengeCount).map(([difficulty, { reward }]) => `**${toTitleCase(difficulty)}:** ${reward} ${sign}`).join("\n"),
					inline: true
				}
			],
			timestamp: Date.now()
		});
	}

	parseChallengeHistory(challengeData, userId) {
		const data = {
			total: {
				count: challengeData.users[userId].length,
				reward: sum(challengeData.users[userId].map(entry => entry.challenge.reward))
			}
		};
		["easy", "medium", "hard"].forEach(difficulty => {
			const challenges = challengeData.users[userId].filter(entry => entry.challenge.difficulty === difficulty);
			data[difficulty] = {
				count: challenges.length,
				reward: challenges.length < 1 ? 0 : sum(challenges.map(entry => entry.challenge.reward))
			};
		});
		return data;
	}

	getLeaderboard(challengeData, sortBy = "count") {
		let leaderboard = [];
		for (const [userId, challengeHistory] of Object.entries(challengeData.users)) {
			leaderboard.push({
				userId,
				count: challengeHistory.length,
				reward: sum(challengeHistory.map(entry => entry.challenge.reward))
			});
		}
		if (sortBy === "reward")
			leaderboard = leaderboard.sort((a, b) => b.reward - a.reward);
		else
			leaderboard = leaderboard.sort((a, b) => b.count - a.count);
		return leaderboard.map((element, index) => ({ ...element, rank: index + 1 }));
	}

	getUserRank(challengeData, userId) {
		const leaderboard = this.getLeaderboard(challengeData, "count");
		const index = leaderboard.findIndex(element => element.userId === userId);
		if (index < 0) return;
		const data = { user: leaderboard[index] };
		if (data.user.rank > 1)
			data.previousUser = leaderboard[index - 1];
		return data;
	}
};
