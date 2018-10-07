const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class BugCommand extends Command {
    constructor(client){
        super(client, {
            name: 'bug',
            memberName: 'bug',
            group: 'utils',
            description: 'Report a bug.',
            examples: ["_bug desc <image attachment>"],
            args: [
                {
                    key: 'desc',
                    prompt: 'Description of the issue.',
                    type: 'string'
                }
            ]
        })
    }
    async run(msg, { desc }){
        if(msg.attachments.size < 1) {
            let bugEmbed = new Discord.RichEmbed()
            .setTitle("Bug Report")
            .setDescription(desc);

            await msg.guild.channels.find("name", "dev-chat").send(bugEmbed);
            msg.channel.send("Bug has been successfully reported. :thumbsup:");
            return;
        };
        let attachment = msg.attachments.first().url;
        let bEmbed = new Discord.RichEmbed()
        .setTitle("Bug Report")
        .setDescription(desc)
        .setImage(attachment);

        await msg.guild.channels.find("name", "dev-chat").send(bEmbed);
        msg.channel.send("Bug has been successfully reported. :thumbsup:");
    }
}
