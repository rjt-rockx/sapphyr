var { RichEmbed } = require("discord.js");

module.exports = class SetRolePriceCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "setroleprice",
            memberName: "setroleprice",
            group: "nadekoconnector",
            userPermissions: ["ADMINISTRATOR"],
            description: "Set the global price for all the roles in the shop.",
            args: [{
                key: "price",
                prompt: "What do you want the price of the roles to be?",
                type: "integer"
            }]
        });
    }
    async task(ctx) {
        let roleprice = await ctx.db.set("roleprice", ctx.args.price),
            botInfo = ctx.nadekoConnector.getBotInfo(),
            embed = new RichEmbed()
            .setTitle("Success")
            .setDescription("Successfully set the role price to " + ctx.args.price + botInfo.bot.currency.sign);
    return await ctx.send(embed);
    }
};