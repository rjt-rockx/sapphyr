var { Command } = require('discord.js-commando');
var { RichEmbed } = require('discord.js');

module.exports = class ApproveCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: 'approve',
            memberName: 'approve',
            group: 'challenges',
            description: 'Approve a challenge and award the submitter. Ex. <approve <message_id> <easy/medium/hard>',
            args: [
                {
                    key: 'ID',
                    prompt: 'The ID of the message to grab.',
                    type: 'string'
                },
                {
                    key: 'Difficulty',
                    prompt: 'The difficulty of the challenge.',
                    type: 'string'
                },
                {
                    key: 'Amount',
                    prompt: 'Amount of cash to reward to submitter.',
                    type: 'integer'
                }
            ]           
        })
    }
    async task(ctx) {
        let botInfo = await ctx.nadekoConnector.getBotInfo();

            let noApprover = new RichEmbed()
                .setTitle("Missing Approver")
                .setDescription("You need to have role: `Challenge Approver` to do this.");
            let channel = new RichEmbed()
                .setTitle("Incorrect Channel.")
                .setDescription(`Please use #challenge-approval.`);
            let missingAmount = new RichEmbed()
                .setTitle("Missing Amount")
                .setDescription("Missing amount to reward to submitter.");
                let role = ctx.message.guild.roles.find("name", "Challenge Approver");
        if (!ctx.message.member.roles.has(role.id)) return await ctx.send(noApprover);
        if (!ctx.args.Amount) return await ctx.send(missingAmount);
        if (!ctx.args.ID) return;
        let appTch = ctx.client.channels.get("455252710732595211");
        appTch.fetchMessage(ctx.args.ID).then(async (msg) => {
            let approved = new RichEmbed()
                .setTitle("Challenge Approved!")
                .addField("Challenge Approved By:", ctx.message.author)
                .addField("Challenge:", msg.content)
                .addField("Submitter:", msg.author)
                .addField("Difficulty:", ctx.args.Difficulty)
                .setTimestamp();
            msg.delete();
            ctx.client.channels.get("507667784285552640").send(approved);
            let reason = "[Sapphyr Challenges] " + ctx.message.author + " approved " + ctx.args.ID + " with amount: " + ctx.args.Amount;
        return await ctx.nadekoConnector.addCurrency(msg.author.id, ctx.args.Amount, reason);
        })
    }
}
