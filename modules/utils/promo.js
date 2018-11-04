const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class PromotionCommand extends Command {
    constructor(client){
        super(client, {
            name: 'promo',
            group: 'utils',
            memberName: 'promo',
            description: 'Vote to promote a user.',
            userPermissions: ["BAN_MEMBERS"],
            examples: ['_promo @everyone Should @StaffMember be promoted for xyz, xyz, xyz?'],
            args: [
                {
                    key: 'promoDesc',
                    prompt: 'What to put inside the promotion vote.',
                    type: 'string'
                }
            ]
        })
    }
    async run(msg, { promoDesc }){
        let promoEmbed = new Discord.RichEmbed()
        .setTitle("User Promotion Voting")
        .setDescription(promoDesc)
        .setTimestamp();
        msg.delete();
        const reactTo = await msg.say(promoEmbed);
        msg.say("@everyone", reactTo);
       reactTo.react("✅");
       reactTo.react("❌");
    }
}