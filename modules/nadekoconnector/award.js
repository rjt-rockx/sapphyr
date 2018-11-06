var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");
module.exports = class AwardCurrencyCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "award",
            description: "Awards a certain amount of currency to a user.",
            group: "nadekoconnector",
            memberName: "award",
            userPermissions: ["ADMINISTRATOR"],
            args: [
                {
                    key: "user",
                    prompt: "User to award currency to",
                    type: "user"
                },
                {
                    key: "amount",
                    prompt: "Amount of currency to award",
                    type: "integer"
                },
                {
                    key: "reason",
                    prompt: "Reason to award the currency",
                    type: "string"
                }
            ]
        });
    }

    async task(ctx) {
        let noReason = new RichEmbed()
            .setTitle("Missing Arguments")
            .setColor("#7959ff")
            .setDescription("Please provide a reason for the award.");
        if (!ctx.nadekoConnector)
            return await ctx.send("NadekoConnector configuration not set.");
        let botInfo = await ctx.nadekoConnector.getBotInfo();
        if (typeof botInfo.bot.currency.sign === "undefined")
            return await ctx.send("Unable to parse NadekoConnector information.");
        if (!ctx.args.reason) return await ctx.send(noReason);
        let dmReason = ctx.args.reason;
        ctx.args.reason = "[Sapphyr] Awarded by: " + ctx.message.author + " | " + ctx.args.reason;
        if (ctx.args.amount === 0) return;
        let response = null;
        if (ctx.args.amount < 0)
            response = await ctx.nadekoConnector.subtractCurrency(ctx.args.user.id, ctx.args.amount, ctx.args.reason);
        if (ctx.args.amount > 0)
            response = await ctx.nadekoConnector.addCurrency(ctx.args.user.id, ctx.args.amount, ctx.args.reason);
        if (typeof response.error !== "undefined") return await ctx.send(response.message);
        if (typeof response.error === "undefined") {
            let Success = new RichEmbed()
                .setTitle("Success")
                .setColor("#7959ff")
                .setDescription(`Successfully awarded ${ctx.args.amount} ${botInfo.bot.currency.sign} to ${ctx.args.user.username}`);
            await ctx.send(Success);
            let embed = new RichEmbed()
                .setTitle("Award")
                .setColor("#7959ff")
                .setDescription(`You've been awarded ${ctx.args.amount} ${botInfo.bot.currency.sign} by ${ctx.message.author.tag} with reason ${dmReason}.`);
            return await ctx.args.user.send(embed);
        }
    }
};
