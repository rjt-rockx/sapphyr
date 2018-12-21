const { TextChannel } = require("discord.js");

module.exports = class ApproverChannelCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "approverchannel",
			description: "Set or remove an approver channel. Challenges for this guild can only be approved in this channel.",
			group: "challenges",
			memberName: "approverchannel",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Set, get or remove the approver channel for this guild.",
					type: "string",
					oneOf: ["set", "get", "remove"]
				},
				{
					key: "channel",
					prompt: "Channel to allow challenge approvals in.",
					type: "channel",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		const approverChannel = await ctx.db.get("approverChannel") || await ctx.db.set("approverChannel", "");
		if (ctx.args.action === "set") {
			if (!(ctx.args.channel instanceof TextChannel))
				return ctx.send("Invalid channel specified.");
			await ctx.db.set("approverChannel", ctx.args.channel.id);
			return ctx.send(`Approver channel successfully set to #${ctx.args.channel.name}.`);
		}
		else if (ctx.args.action === "get") {
			if (!approverChannel)
				return ctx.send("No approver channel set.");
			if (!ctx.guild.channels.has(approverChannel)) {
				await ctx.db.set("approverChannel", "");
				return ctx.send("Approver channel not found.");
			}
			return ctx.send(`Approver channel is currently set to #${ctx.guild.channels.get(approverChannel).name}.`);
		}
		else if (ctx.args.action === "remove") {
			await ctx.db.set("approverChannel", "");
			return ctx.send("Approver channel successfully removed.");
		}
	}
};
