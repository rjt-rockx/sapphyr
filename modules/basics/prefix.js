module.exports = class PrefixCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "prefix",
			description: "Get, set or remove the bot's prefix for this guild.",
			group: "basics",
			memberName: "prefix",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			userPermissions: ["ADMINISTRATOR"],
			args: [
				{
					key: "newprefix",
					prompt: "New prefix to be used for this guild.",
					type: "string",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		const prefix = await ctx.db.get("prefix") || ctx.db.set("prefix", "_");
		if (ctx.args.newprefix.toLowerCase() === "none")
			return ctx.send(`Guild prefix set to ${prefix}`);
		else if (ctx.args.newprefix) {
			await ctx.db.set("prefix", ctx.args.newprefix.toLowerCase());
			ctx.guild.commandPrefix = ctx.args.newprefix.toLowerCase();
			return ctx.send(`Guild prefix set to ${ctx.args.newprefix.toLowerCase()}`);
		}
	}
};
