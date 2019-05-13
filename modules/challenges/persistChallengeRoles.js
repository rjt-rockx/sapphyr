module.exports = class PersistChallengeRoles extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "persistchallengeroles",
			description: "Make challenge roles persistent i.e. challenge roles will be re-added every 15 minutes if manually removed.",
			group: "challenges",
			memberName: "persistchallengeroles",
			aliases: ["prstchrls"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Whether to enable or disable persisting challenge roles.",
					type: "string",
					oneOf: ["enable", "disable"]
				}
			]
		});
	}

	async task(ctx) {
		const challengeRoles = await ctx.db.get("challengeRoles") || await ctx.db.set("challengeRoles", {});
		if (ctx.args.action.toLowerCase() === "enable") {
			challengeRoles.persistent = true;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send("Challenge roles will persist from now on.");
		}
		else if (ctx.args.action.toLowerCase() === "disable") {
			challengeRoles.persistent = false;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send("Challenge roles will not persist from now on.");
		}
		else return ctx.send("Invalid action specified.");
	}
};
