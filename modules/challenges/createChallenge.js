const shortId = require("shortid");

module.exports = class CreateChallengeCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "createchallenge",
			description: "Create a challenge for this guild. Stores the challenge and returns its ID for future reference. Can only be created by people with the approver role.",
			group: "challenges",
			memberName: "createchallenge",
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
			return ctx.selfDestruct(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			return ctx.selfDestruct("Approver role not found.");
		}
		if (!ctx.member.roles.has(approverRole))
			return ctx.selfDestruct(`You need the ${ctx.guild.roles.get(approverRole).name} to use this command.`);
		const id = shortId.generate();
		ctx.send(`Challenge: [${ctx.args.difficulty}] ${ctx.args.challenge}\nID: ${id}`);
	}
};
