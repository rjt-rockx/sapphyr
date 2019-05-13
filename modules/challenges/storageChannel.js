const { TextChannel } = require("discord.js");

module.exports = class StorageChannel extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "storagechannel",
			description: "Set or remove an attachment storage channel. If set, attachments of challenge submissions will be stored in this channel.",
			group: "challenges",
			memberName: "storagechannel",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Set, get or remove the storage channel for this guild.",
					type: "string",
					oneOf: ["set", "get", "remove"]
				},
				{
					key: "channel",
					prompt: "Channel to store attachments in.",
					type: "channel",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		const storageChannel = await ctx.db.get("storageChannel") || await ctx.db.set("storageChannel", "");
		if (ctx.args.action === "set") {
			if (!(ctx.args.channel instanceof TextChannel))
				return ctx.send("Invalid channel specified.");
			await ctx.db.set("storageChannel", ctx.args.channel.id);
			return ctx.send(`Storage channel successfully set to #${ctx.args.channel.name}.`);
		}
		else if (ctx.args.action === "get") {
			if (!storageChannel)
				return ctx.send("No storage channel set.");
			if (!ctx.guild.channels.has(storageChannel)) {
				await ctx.db.set("storageChannel", "");
				return ctx.send("Storage channel not found.");
			}
			return ctx.send(`Storage channel is currently set to #${ctx.guild.channels.get(storageChannel).name}.`);
		}
		else if (ctx.args.action === "remove") {
			await ctx.db.set("storageChannel", "");
			return ctx.send("Storage channel successfully removed.");
		}
	}
};
