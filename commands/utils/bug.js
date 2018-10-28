const Discord = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class BugCommand extends global.utils.baseCommand {
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
    async task(ctx){
        if(ctx.message.attachments.size < 1) {
            let bugEmbed = new Discord.RichEmbed()
            .setTitle("Bug Report")
            .setDescription(ctx.args.desc);

            await this.client.channels.get("477644168299151375").send(bugEmbed);
            ctx.message.channel.send("Bug has been successfully reported. :thumbsup:");
            return;
        };
        let attachment = ctx.message.attachments.first().url;
        let bEmbed = new Discord.RichEmbed()
        .setTitle("Bug Report")
        .setDescription(ctx.args.desc)
        .setImage(attachment);

        await this.client.channels.get("477644168299151375").send(bEmbed);
        ctx.message.channel.send("Bug has been successfully reported. :thumbsup:");
    }
}
