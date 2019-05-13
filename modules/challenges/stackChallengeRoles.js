module.exports = class StackChallengeRoles extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "stackchallengeroles",
			description: "Stack challenge roles over the previous ones.",
			group: "challenges",
			memberName: "stackchallengeroles",
			aliases: ["stkchrls"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Whether to enable or disable stacking challenge roles.",
					type: "string",
					oneOf: ["enable", "disable"]
				}
			]
		});
	}

	async task(ctx) {
		const challengeRoles = await ctx.db.get("challengeRoles") || await ctx.db.set("challengeRoles", {});
		if (ctx.args.action.toLowerCase() === "enable") {
			challengeRoles.stacked = true;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send("Challenge roles will stack from now on.");
		}
		else if (ctx.args.action.toLowerCase() === "disable") {
			challengeRoles.stacked = false;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send("Challenge roles will not stack from now on.");
		}
		else return ctx.send("Invalid action specified.");
	}
};
