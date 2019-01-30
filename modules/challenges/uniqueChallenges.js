module.exports = class UniqueChallengesCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "uniquechallenges",
			description: "Ensure that challenges can be approved only once per user.",
			group: "challenges",
			memberName: "uniquechallenges",
			aliases: ["ucs"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Whether to enable or disable unique challenges.",
					type: "string",
					oneOf: ["enable", "disable"]
				}
			]
		});
	}

	async task(ctx) {
		if (ctx.args.action.toLowerCase() === "enable") {
			await ctx.db.set("uniqueChallenges", true);
			return ctx.send("Unique challenges enabled.");
		}
		else if (ctx.args.action.toLowerCase() === "disable") {
			await ctx.db.set("uniqueChallenges", false);
			return ctx.send("Unique challenges disabled.");
		}
		else return ctx.send("Invalid action specified.");
	}
};
