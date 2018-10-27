var { Command } = require("discord.js-commando");
module.exports = class PingCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Checks the bot's ping.",
            group: "basics",
            memberName: "ping"
        });
    }

    async task({ message }) {
        let pingMsg = await message.channel.send("🔁 | Pinging ...");
        return await pingMsg.edit(`✅ | ${pingMsg.createdTimestamp - message.createdTimestamp}ms.`);
    }
};
