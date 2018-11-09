const { Command } = require("discord.js-commando"), Discord = require("discord.js");
module.exports = class SayCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "say",
            group: "fun",
            memberName: "say",
            description: "Make the bot say something.",
            userPermissions: ["MANAGE_MESSAGES"],
            args: [
                {
                    key: "text",
                    prompt: "The text you want the bot to say.",
                    type: "string"
                }
            ]
        });
    }

    async task(ctx) {
        if (ctx.args.text.length > 1000) return ctx.message.channel.send("Please enter less than 1,000 characters while using this command");
        await ctx.message.delete();
        return await ctx.embed({ description: ctx.args.text });
    }
};
