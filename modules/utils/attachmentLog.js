const { Channel } = require("discord.js");

module.exports = class AttachmentLogCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "attachmentlog",
			description: "Enable or disable attachment logging in a particular channel.",
			group: "utils",
			memberName: "attachmentlog",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "enabled",
					prompt: "Whether to enable or disable attachment logging.",
					type: "string",
					oneOf: ["enable", "disable"]
				},
				{
					key: "channel",
					prompt: "Channel to log attachments in.",
					type: "channel",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		let logChannel = await ctx.db.get("attachmentLogChannel");
		if (ctx.args.enabled === "enable") {
			if (ctx.args.channel === "none") {
				if (!logChannel) return ctx.send("Invalid attachment log channel specified.");
				if (this.client.channels.has(logChannel))
					return ctx.send(`Attachment log channel successfully set to ${this.client.channels.get(logChannel).name}`);
			}
			else if ((ctx.args.channel instanceof Channel) && this.client.channels.has(ctx.args.channel.id)) {
				await ctx.db.set("attachmentLogChannel", logChannel = ctx.args.channel.id);
				return ctx.send(`Attachment log channel successfully set to ${this.client.channels.get(logChannel).name}`);
			}
		}
		else if (ctx.args.enabled === "disable") {
			logChannel = await ctx.db.set("attachmentLogChannel", null);
			return ctx.send("Attachment log channel successfully disabled.");
		}
	}
};
