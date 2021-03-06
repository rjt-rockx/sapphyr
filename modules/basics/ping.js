module.exports = class Ping extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "ping",
			description: "Checks the bot's ping.",
			group: "basics",
			memberName: "ping",
			clientPermissions: ["SEND_MESSAGES"]
		});
	}

	async task(ctx) {
		const pingMsg = await ctx.send("Pinging ...");
		await pingMsg.edit(`Message Ping: ${Math.round(pingMsg.createdTimestamp - ctx.message.createdTimestamp)}ms | Websocket Ping: ${Math.round(this.client.ping)}ms`);
	}
};
