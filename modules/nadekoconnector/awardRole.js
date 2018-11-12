const { Command } = require("discord.js-commando"), { RichEmbed } = require("discord.js"), log = require("fancy-log");

module.exports = class AwardRoleCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "awardrole",
            memberName: "awardrole",
            userPermissions: ["ADMINISTRATOR"],
            group: "nadekoconnector",
            description: "Award money to a role.",
            args: [
                {
                    key: "role",
                    prompt: "The role to award.",
                    type: "string"
                },
                {
                    key: "amount",
                    prompt: "amount of currency to award.",
                    type: "integer"
                },
                {
                    key: "reason",
                    prompt: "reason to award the currency.",
                    type: "string"
                }
            ]
        });
    }
    async task(ctx) {
        let botInfo = await ctx.nadekoConnector.getBotInfo();

        let missingroles = new RichEmbed()
            .setTitle("Missing role")
            .setColor("#7959ff")
            .setDescription("Missing role to award, the role is case sensitive.");
        let missingamount = new RichEmbed()
            .setTitle("Missing amount")
            .setColor("#7959ff")
            .setDescription("Missing amount to award.");
        let missingreason = new RichEmbed()
            .setTitle("Missing reason")
            .setColor("#7959ff")
            .setDescription("Missing reason to award");
        let nadekoError = new RichEmbed()
            .setTitle("Error with NadekoConnector");
        let successEmbed = new RichEmbed()
            .setTitle("Success")
            .setColor("#7959ff")
            .setDescription(`Successfully awarded ${ctx.args.amount} ${botInfo.bot.currency.sign} to role ${ctx.args.role}`);
        
        if (!ctx.message.guild.roles.find(role => role.name === ctx.args.role)) return await ctx.send(missingroles);
        if (!ctx.args.amount) return await ctx.send(missingamount);
        if (!ctx.args.reason) return await ctx.send(missingreason);

        let role = ctx.message.guild.roles.find(r => r.name === ctx.args.role);
        ctx.args.reason = "[Sapphyr] Awarded by " + ctx.user + " | " + ctx.args.reason;

        role.members.map(async (member) => {
            let embed = new RichEmbed();
            let response;

            if (ctx.args.amount < 0) {
                response = await ctx.nadekoConnector.subtractCurrency(member.id, ctx.args.amount, ctx.args.reason);
                if (response.error) return await ctx.embed(nadekoError.setDescription(response.message));

                log("Currency subtracted from role " + ctx.args.role + " with reason " + ctx.args.reason + "\n Currency added: " + ctx.args.amount);
                return embed.setTitle("Currency Removed")
                    .setColor("#7959ff")
                    .setDescription(`${ctx.args.amount} ${botInfo.bot.currency.sign} has been removed from your account by ${ctx.message.author.tag} with reason ${ctx.args.reason}.`);
            }
            if (ctx.args.amount > 0) {
                response = await ctx.nadekoConnector.addCurrency(member.id, ctx.args.amount, ctx.args.reason);
                if (response.error) return await ctx.embed(nadekoError.setDescription(response.message));
                
                log("Currency added to role " + ctx.args.role + " with reason " + ctx.args.reason + "\n Currency added: " + ctx.args.amount);
                return embed.setTitle("Currency Added")
                    .setColor("#7959ff")
                    .setDescription(`${ctx.args.amount} ${botInfo.bot.currency.sign} has been added to your account by ${ctx.message.author.tag} with reason ${ctx.args.reason}.`);
            }
            member.send(embed);
        });
        return ctx.message.channel.send(successEmbed);
    }
};
