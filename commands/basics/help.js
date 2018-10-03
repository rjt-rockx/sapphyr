var { Command } = require("discord.js-commando");
module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: "help",
            description: "Gives help for a command.",
            group: "basics",
            memberName: "help"
        });
    }

    async run(msg, args) {
        await msg.channel.send(args.length > 0 ? args.toString() : "[]");
    }
};
