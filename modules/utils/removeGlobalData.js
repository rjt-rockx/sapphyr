module.exports = class RemoveGlobalDataCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "removeglobaldata",
			description: "Removes stored data globally",
			group: "utils",
			memberName: "removeglobaldata",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "key",
					prompt: "Key that the data was stored under",
					type: "string",
					default: "data"
				}
			]
		});
	}

	async task(ctx) {
		await ctx.globalDb.remove(ctx.args.key);
		await ctx.message.channel.send("Data successfully removed!");
	}
};
