const { RichEmbed } = require("discord.js");

module.exports = class ClearCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "clear",
            memberName: "clear",
            group: "basics",
            userPermissions: ["MANAGE_MESSAGES"],
            description: "Clear xyz amount of messages.",
            args: [{
                key: "messages",
                prompt: "How many messages do you want to clear?",
                type: "integer",
                default: "50"
            }]
        });
    }
    async task(ctx) {
        let embed = new RichEmbed()
        .setDescription(`Successfully cleared **${ctx.args.messages}** messages.`);
        await ctx.message.channel.bulkDelete(ctx.args.messages);
        ctx.send(embed);
    }
};