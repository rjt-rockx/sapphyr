const { Channel } = require("discord.js");

module.exports = class ReactionLog extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "reactionlog",
			description: "Enable or disable reaction logging in a particular channel.",
			group: "utils",
			memberName: "reactionlog",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "enabled",
					prompt: "Whether to enable or disable reaction logging.",
					type: "string",
					oneOf: ["enable", "disable"]
				},
				{
					key: "channel",
					prompt: "Channel to log reactions in.",
					type: "channel",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		let logChannel = await ctx.db.get("reactionLogChannel");
		if (ctx.args.enabled === "enable") {
			if (ctx.args.channel === "none") {
				if (!logChannel) return ctx.send("Invalid reaction log channel specified.");
				if (this.client.channels.has(logChannel))
					return ctx.send(`Reaction log channel successfully set to ${this.client.channels.get(logChannel).name}`);
			}
			else if ((ctx.args.channel instanceof Channel) && this.client.channels.has(ctx.args.channel.id)) {
				await ctx.db.set("reactionLogChannel", logChannel = ctx.args.channel.id);
				return ctx.send(`Reaction log channel successfully set to ${this.client.channels.get(logChannel).name}`);
			}
		}
		else if (ctx.args.enabled === "disable") {
			logChannel = await ctx.db.set("reactionLogChannel", null);
			return ctx.send("Reaction log channel successfully disabled.");
		}
	}
};
