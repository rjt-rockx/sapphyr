module.exports = class PingCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Checks the bot's ping.",
            group: "basics",
            memberName: "ping"
        });
    }

    async task(ctx) {
        let pingMsg = await ctx.send("🔁 | Pinging ...");
        return await pingMsg.edit(`✅ | ${pingMsg.createdTimestamp - message.createdTimestamp}ms.\nWebsocket Ping: ${client.ping} ms`);
    }
};
