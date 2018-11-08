const { Command } = require("discord.js-commando");
const Discord = require("discord.js");

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            group: "fun",
            memberName: "say",
            description: "bot sends args",
            userPermissions: ["MANAGE_MESSAGES"],
            args: [
                {
                    key: "text",
                    prompt: "What text would you like the bot to say?",
                    type: "string"
                }
            ]
        });
    }

    run(msg, { text }) {
        msg.delete();
        let sayEmbed = new Discord.RichEmbed()
        .setDescription(text);
        return msg.channel.send(sayEmbed);
    }
};