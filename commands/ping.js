var { Command } = require("commando");
module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Checks the bot's ping.",
        });
    }

    async run(msg) {
        if (!msg.editable) {
            let pingMsg = await msg.reply("Pinging...");
            return pingMsg.edit(`Pong! | ${pingMsg.createdTimestamp - msg.createdTimestamp}ms.`);
        } else {
            await msg.edit("Pinging...");
            return msg.edit(`Pong! | ${msg.editedTimestamp - msg.createdTimestamp}ms.`);
        }
    }
};
