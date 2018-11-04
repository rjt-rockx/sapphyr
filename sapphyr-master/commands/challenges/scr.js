var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");

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
                    key: "Difficulty",
                    prompt: "Easy/Medium/Hard",
                    type: "string"
                },
                {
                    key: "Amount",
                    prompt: "Amount to reward to challenge difficulty.",
                    type: "integer"
                }
            ]
        });
    }
    async task(ctx) {
        let error;
        let response = null;
        if (typeof ctx.args.Difficulty !== "string" || !ctx.args.Difficulty) {
            error = new RichEmbed()
            .setDescription("Please specify a string/difficulty.");
        return await ctx.send(error);
        }

        if (!ctx.args.Amount) {
             error = new RichEmbed()
             .setDescription("Please specify an amount to reward to a difficulty.");
        return await ctx.send(error);
        }
        let difficulty = ctx.args.Difficulty.toString();

        if (difficulty == "easy") {
            response = await ctx.db.set("challenges/easy", ctx.args.Amount);
        return await ctx.send("Success!");
        }

        if (difficulty == "medium") {
            response = await ctx.db.set("challenges/medium", ctx.args.Amount);
        return await ctx.send("Success!");
        }

        if(difficulty == "hard") {
            response = await ctx.db.set("challenges/hard", ctx.args.Amount);
        return await ctx.send("Success!");
        }
    }
};
