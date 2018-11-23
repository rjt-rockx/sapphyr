module.exports = class SaveDataCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "showglobaldata",
			description: "Shows globally stored data",
			group: "utils",
			memberName: "showglobaldata",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "key",
					prompt: "Key that the data was stored under",
					type: "string",
					default: "data",
				},
			],
		});
	}

	async task(ctx) {
		let data = await ctx.globalDb.get(ctx.args.key);
		if (typeof data === "undefined") data = "No value was set for this key!";
		await ctx.message.channel.send(typeof data === "string" ? data : JSON.stringify(data));
	}
};
