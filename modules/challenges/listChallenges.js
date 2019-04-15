const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class ListChallengesCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "listchallenges",
			memberName: "listchallenges",
			aliases: ["listch"],
			group: "challenges",
			description: "List all challenges created in this guild.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			guildOnly: true,
			args: [
				{
					key: "activeOnly",
					prompt: "Fetch only challenges that are currently active",
					type: "boolean",
					default: true
				}
			]
		});
	}
	async task(ctx) {
		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", {});
		if (!challengeData.challenges || (Array.isArray(challengeData.challenges) && challengeData.challenges.length < 1))
			return ctx.send("No challenges found.");

		const result = await ctx.nadekoConnector.getBotInfo();
		if (result.error) {
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to get bot information.");
		}
		const sign = result.currency.sign;

		const challenges = ctx.args.activeOnly ? challengeData.challenges.filter(challenge => challenge.enabled === true) : challengeData.challenges;
		const challengeFields = challenges.map(challenge => ({
			name: `#${challenge.id}: [${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`,
			value: [
				`Reward: ${challenge.reward} ${sign} | Created on ${new Date(challenge.timestamp).toISOString().replace(/[TZ]/g, " ")}`,
				`Challenge is currently ${challenge.enabled ? "active" : "inactive"}.`
			].join("\n")
		}));

		if (!challengeFields.length)
			return ctx.send(`No ${ctx.args.activeOnly ? "active" : ""}challenges found.`);

		return new global.utils.fieldPaginator(ctx.channel, ctx.user, challengeFields, 15, {
			embedTemplate: {
				title: `Challenges in ${ctx.guild.name}`,
				thumbnail: { url: ctx.guild.iconURL }
			}
		});
	}
};
