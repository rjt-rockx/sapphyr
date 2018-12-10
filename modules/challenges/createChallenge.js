const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

module.exports = class CreateChallengeCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "createchallenge",
			description: "Create a challenge for this guild. Stores the challenge and returns its ID for future reference. Can only be created by people with the approver role.",
			group: "challenges",
			memberName: "createchallenge",
			aliases: ["crch"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "difficulty",
					prompt: "The difficulty of the challenge.",
					type: "string",
					oneOf: ["easy", "medium", "hard"]
				},
				{
					key: "challenge",
					prompt: "The difficulty of the challenge.",
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
		if (!Object.keys(challengeData.rewards).includes(ctx.args.difficulty))
			return ctx.send("No reward specified for this difficulty.");
		if (!challengeData.challenges)
			challengeData.challenges = [];
		const timestamp = Date.now(), id = challengeData.challenges.length + 1;
		challengeData.challenges.push({
			id, timestamp,
			challenge: ctx.args.challenge,
			difficulty: ctx.args.difficulty,
			reward: challengeData.rewards[ctx.args.difficulty],
			enabled: true
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
					value: `Reward: ${challengeData.rewards[ctx.args.difficulty]}`
				}
			],
			footer: { text: `ID: ${id}` },
			timestamp
		});
	}
};