var { Command } = require('discord.js-commando');
var { RichEmbed } = require('discord.js');
var ms = require('ms');

module.exports = class BuyCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: 'buy',
            memberName: 'buy',
            group: 'nadekoconnector',
            description: 'Buy a color role. Ex. [prefix]buy <id>',
            args: [
                {
                    key: 'RoleID',
                    prompt: 'The number/ID of the role to buy.',
                    type: 'string'
                }
            ]
        })
    }
    async task(ctx) {
        let rstring;
        let reason;

        let botInfo = ctx.nadekoConnector.getBotInfo();

            let noID = new RichEmbed()
            .setTitle("Missing Arguments")
            .setDescription("Please provide an ID of a role to buy.");
            let cantAfford = new RichEmbed()
            .setTitle("Currency")
            .setDescription("You don't have the money required to purchase this role.");
            let success = new RichEmbed()
            .setTitle("Success")
            .setDescription("You have successfully purchased your role.");
            let nullRole = new RichEmbed()
            .setTitle("Missing Role ID")
            .setDescription(`I cannot find a role with ID: ${ctx.args.RoleID}.`);

        if (!ctx.args.RoleID) return await ctx.send(noID);
        if (ctx.args.RoleID > 11) return await ctx.send(nullRole);
        let currency = await ctx.nadekoConnector.getCurrency(ctx.message.author.id);
        if (currency.currency < 2500) return await ctx.send(cantAfford);

        // roles

        async function timer(role, user) {
            setTimeout(async function remove(){
                await user.removeRole(role.id);
                let removed = new RichEmbed()
                .setTitle("Role Removed")
                .setDescription("Your role " + "`" + role + "`" + " has been removed.")
                .addField("Reason", "Time Limit Reached.");
            user.send(removed);
            }, 1209600000);
        } 

        if (ctx.args.RoleID == "1") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);
            rstring = "Balanced Green";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);
        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "2") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);
            rstring = "Brilliant Red";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "3") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Brave Purple";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "4") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Sunny Yellow";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "5") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Rock Black";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "6") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Firey Orange";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "7") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Raged Red";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "8") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Pretty Pink";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "9") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Sky Blue";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "10") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Natural Green";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }

        if (ctx.args.RoleID == "11") {
            if (currency.currency < 2500) return await ctx.send(cantAfford);

            rstring = "Passionate Purple";
            let role = ctx.message.guild.roles.find("name", rstring);
            await ctx.message.member.addRole(role.id);
            reason = "[Sapphyr] " + "Purchased " + "`" + rstring + "`";
            ctx.nadekoConnector.subtractCurrency(ctx.message.author.id, 2500, reason);
            timer(role, ctx.message.member);

        return await ctx.send(success);
        }
    }
}
