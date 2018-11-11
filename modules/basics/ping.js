var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");
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
        var embed = new RichEmbed()
        .setDescription("🔁 | Pinging...");
        let pingMsg = await ctx.send(embed);
        var completed = new RichEmbed()
        .setDescription(`✅ | ${pingMsg.createdTimestamp - ctx.message.createdTimestamp}ms.\nWebsocket Ping: ${ctx.client.ping} ms`);
        return await pingMsg.edit(completed);
    }
};
