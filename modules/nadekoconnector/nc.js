module.exports = class NcSet extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "ncset",
			description: "Sets the NadekoConnector configuration for this guild.",
			group: "nadekoconnector",
			memberName: "ncset",
			aliases: ["nadekoset"],
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["ADMINISTRATOR"],
			args: [
				{
					key: "address",
					prompt: "Address to use for NadekoConnector endpoints.",
					type: "string"
				},
				{
					key: "password",
					prompt: "Password for the NadekoConnector instance.",
					type: "string"
				}
			]
		});
	}

	async task(ctx) {
		if (!ctx.nadekoConnector) await ctx.db.set("nadekoconnector", { enabled: false });
		await ctx.message.delete();
		const tryNc = new global.utils.nadekoConnector(ctx.args.address, ctx.args.password),
			botInfo = await tryNc.getBotInfo();
		if (typeof botInfo.error !== "undefined") {
			await ctx.message.channel.send("Unable to connect to the given NadekoConnector instance.");
		}
		if (typeof botInfo.error === "undefined") {
			await ctx.db.set("nadekoDbConnector", { enabled: false });
			await ctx.db.set("nadekoconnector", { address: ctx.args.address, password: ctx.args.password, enabled: true });
			await ctx.message.channel.send("NadekoConnector configuration stored.");
		}
	}
};
