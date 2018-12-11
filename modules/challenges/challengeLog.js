const { TextChannel } = require("discord.js");

module.exports = class ChallengeLogCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "challengelog",
			description: "Set or remove the channel to log all challenges in.",
			group: "challenges",
			memberName: "challengelog",
			aliases: ["chlog"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Set, get or remove the challenge log channel for this guild.",
					type: "string",
					oneOf: ["set", "get", "remove"]
				},
				{
					key: "channel",
					prompt: "Channel to log challenge approvals/denials in.",
					type: "channel",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", {});
		if (!challengeData.logChannel)
			challengeData.logChannel = "";
		if (ctx.args.action === "set") {
			if (!(ctx.args.channel instanceof TextChannel))
				return ctx.send("Invalid channel specified.");
			challengeData.logChannel = ctx.args.channel.id;
			await ctx.db.set("challengeData", challengeData);
			return ctx.send(`Challenge log channel successfully set to #${ctx.args.channel.name}.`);
		}
		else if (ctx.args.action === "get") {
			if (!challengeData.logChannel)
				return ctx.send("No challenge log channel set.");
			if (!ctx.guild.channels.has(challengeData.logChannel)) {
				challengeData.logChannel = "";
				await ctx.db.set("challengeData", challengeData);
				return ctx.send("Challenge log channel not found.");
			}
			return ctx.send(`Challenge log channel is currently set to #${ctx.guild.channels.get(challengeData.logChannel).name}.`);
		}
		else if (ctx.args.action === "remove") {
			challengeData.logChannel = "";
			await ctx.db.set("challengeData", challengeData);
			return ctx.send("Challenge log channel successfully removed.");
		}
	}
};
