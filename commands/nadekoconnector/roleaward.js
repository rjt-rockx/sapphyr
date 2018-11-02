var { Command } = require('discord.js-commando');
var { RichEmbed } = require('discord.js');
var log = require('fancy-log');

module.exports = class RoleAwardCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: 'roleaward',
            memberName: 'roleaward',
            userPermissions: ["ADMINISTRATOR"],
            group: 'nadekoconnector',
            description: 'Award money to a role. Ex. <award <role> <amount> <reason>',
            args: [
                {
                    key: 'Role',
                    prompt: 'The role to award.',
                    type: 'string'
                },
                {
                    key: 'Amount',
                    prompt: 'Amount of money to reward.',
                    type: 'integer'
                },
                {
                    key: 'Reason',
                    prompt: 'Reason for the award useage.',
                    type: 'string'
                }
            ]
        })
    }
    async task(ctx) {
        let botInfo = await ctx.nadekoConnector.getBotInfo();
            let missingroles = new RichEmbed()
                .setTitle("Missing Role")
                .setDescription("Missing role to award, the role is cap sensitive.");
            let missingamount = new RichEmbed()
                .setTitle("Missing Amount")
                .setDescription("Missing amount to award.");
            let missingreason = new RichEmbed()
                .setTitle("Missing Reason")
                .setDescription("Missing reason to award");
            let successEmbed = new RichEmbed()
                .setTitle("Success")
                .setDescription(`Successfully awarded ${ctx.args.Amount} ${botInfo.bot.currency.sign} to role ${ctx.args.Role}`);
        // I hate embeds, feels good to get back to the actual code.
        if (!ctx.message.guild.roles.find("name", ctx.args.Role)) return await ctx.message.channel.send(missingroles);
        if (!ctx.args.Amount) return await ctx.message.channel.send(missingamount);
        let responce = null;
        if (!ctx.args.Reason) return await ctx.message.channel.send(missingreason);
        let role = ctx.message.guild.roles.find("name", ctx.args.Role);
        let rolemembers = role.members.map(members => members.id);
        ctx.args.Reason = "[Sapphyr] Awarded by " + ctx.message.author + " | " + ctx.args.Reason;
        rolemembers.forEach(m => {
            if (ctx.args.Amount < 0) {
                responce = await ctx.nadekoConnector.subtractCurrency(m, ctx.args.Amount, ctx.args.Reason);
             log("Currency subtracted from role " + ctx.args.Role + " with reason " + ctx.args.Reason + "\n Currency added: " + ctx.args.Amount);
            }
            if (ctx.args.Amount > 0) {
             responce = await ctx.nadekoConnector.addCurrency(m, ctx.args.Amount, ctx.args.Reason);
             log("Currency added to role " + ctx.args.Role + " with reason " + ctx.args.Reason + "\n Currency added: " + ctx.args.Amount);
            }
        });
    return ctx.message.channel.send(successEmbed);
    }
}
