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
        await ctx.message.delete();
        return await ctx.embed({ description: ctx.args.text });
    }
};
