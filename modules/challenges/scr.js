const { Command } = require("discord.js-commando"), { RichEmbed } = require("discord.js");

module.exports = class SetChallengerRewardCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "setchallengerreward",
            memberName: "src",
            userPermissions: ["ADMINISTRATOR"],
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
        await ctx.db.set(`challenges/${ctx.args.difficulty}`, ctx.args.amount);
        return await ctx.send("Success!");
    }
};
