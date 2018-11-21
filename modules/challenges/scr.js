const { Command } = require("discord.js-commando"), { RichEmbed } = require("discord.js");

module.exports = class SetChallengeRewardCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "scr",
            memberName: "scr",
            userPermissions: ["ADMINISTRATOR"],
            clientPermissions: ["SEND_MESSAGES"],
            group: "challenges",
            description: "Set a challenge submitter reward for one of 3 difficulties.",
            args: [
                {
                    key: "difficulty",
                    prompt: "Easy/Medium/Hard",
                    type: "string",
                    oneOf: ["easy", "medium", "hard"]
                },
                {
                    key: "amount",
                    prompt: "Amount to reward to challenge difficulty.",
                    type: "integer"
                }
            ]
        });
    }
    async task(ctx) {
        let difrewards = {
            easy: 50,
            medium: 100,
            hard: 150
        };
        try {
            let document = await ctx.db.get("difrewards");
            if (!document) {
                document = await ctx.db.set("difrewards", difrewards);
            } else {
                await Object.defineProperty(difrewards, ctx.args.difficulty, {
                    value: ctx.args.amount,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
                await ctx.db.set("difrewards", difrewards);
            }
        } catch (e) {
            console.error(e);
        }
        return await ctx.send("Success!");
    }
};
