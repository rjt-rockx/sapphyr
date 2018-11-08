const { Command } = require("discord.js-commando");
const Discord = require("discord.js");
module.exports = class FakeBanCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "fakeban",
            group: "fun",
            memberName: "fakeban",
            examples: ["_fakeban @user LoLoLoLoL"],
            description: "Fake ban a guild member.",
            args: [
                {
                    key: "userToFakeban",
                    prompt: "Who to fake ban?",
                    type: "user"
                },
                {
                    key: "reason",
                    prompt: "Reason for the fake ban.",
                    type: "string"
                }
            ]
        });
    }

    async task(ctx) {
        await ctx.message.delete();
        await ctx.embed({
            title: "User Banned.",
            description: `${ctx.args.userToFakeban.tag} has been banned from ${ctx.guild.name}`,
            fields: [
                {
                    name: "Reason",
                    value: ctx.args.reason,
                    inline: true
                },
                {
                    name: "Moderator",
                    value: ctx.user.tag,
                    inline: true
                }
            ]
        });
        await ctx.args.userToFakeban.send({
            embed: {
                title: `You were banned by ${ctx.user.tag} in ${ctx.guild.name}!`,
                fields: [{
                    name: "Reason",
                    value: ctx.args.reason
                }],
                footer: {
                    text: "This is a fake ban, please don't take it seriously :b"
                }
            }
        });
    }
};
