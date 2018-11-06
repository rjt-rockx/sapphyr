var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");

module.exports = class DenyCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "deny",
            memberName: "deny",
            group: "challenges",
            description: "Deny a challenge.",
            args: [
                {
                    key: "id",
                    prompt: "ID of the message to grab.",
                    type: "string"
                }
            ]
        });
    }
    async task(ctx) {
        let noApprover = new RichEmbed()
            .setTitle("Missing Approver")
            .setColor("#7959ff")
            .setDescription("You need to have role: `Challenge Approver` to do this.");

        let role = ctx.message.guild.roles.find("name", "Challenge Approver");
        if (!ctx.message.member.roles.has(role.id)) return await ctx.send(noApprover);
        if (!ctx.args.id) return;
        let appTch = ctx.client.channels.get("455252710732595211");
        let message = await appTch.fetchMessage(ctx.args.id);
        let embed = new RichEmbed()
            .setTitle("Denied.")
            .setColor("#7959ff")
            .setDescription("Your challenge submission has been denied.");
        await message.delete();
        await message.author.send(embed);
        let success = new RichEmbed()
            .setTitle("Success.")
            .setDescription("Challenge Denied")
            .setColor("#7959ff")
            .addField("Denied by:", ctx.message.author)
            .addField("Submitter:", message.author)
            .addField("Challenge:", message.content)
            .addField("Money Rewarded:", "False")
            .setTimestamp();
        await ctx.send(success);
    }
};
