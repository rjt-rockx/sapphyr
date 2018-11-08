const { Command } = require("discord.js-commando"), Discord = require("discord.js");
const choices = [
    "Yes.",
    "No.",
    "Maybe.",
    "Studies agree.",
    "Studies do not agree.",
    "Yup.",
    "Indeed.",
    "For sure.",
    "Umm...no.",
    "Nope.",
    "Really, no, just no.",
    "No u.",
    "Nah."
];
module.exports = class EightBallCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "8ball",
            group: "fun",
            memberName: "8ball",
            description: "Ask a question to the magic 8-ball.",
            examples: ["_8ball is sapphyr awesome?"],
            arguments: [
                {
                    key: "question",
                    prompt: "Question to ask the magic 8-ball.",
                    type: "string"
                }
            ]
        });
    }

    async task(ctx) {
        let response = choices[Math.floor(Math.random() * choices.length)];
        await ctx.embed({
            title: ctx.args.question,
            description: response
        });
    }
};
