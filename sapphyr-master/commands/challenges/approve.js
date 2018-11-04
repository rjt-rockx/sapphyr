var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");

module.exports = class ApproveCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "approve",
            memberName: "approve",
            group: "challenges",
            description: "Approve a challenge and award the submitter. Ex. <approve <message_id> <easy/medium/hard>",
            args: [
                {
                    key: "ID",
                    prompt: "The ID of the message to grab.",
                    type: "string"
                },
                {
                    key: "Difficulty",
                    prompt: "The difficulty of the challenge.",
                    type: "string"
                }
            ]
        });
    }
    async task(ctx) {
        let botInfo = await ctx.nadekoConnector.getBotInfo();
        let rewardAmount;
            let noApprover = new RichEmbed()
                .setTitle("Missing Approver")
                .setColor("#7959ff")
                .setDescription("You need to have role: `Challenge Approver` to do this.");
            let channel = new RichEmbed()
                .setTitle("Incorrect Channel.")
                .setColor("#7959ff")
                .setDescription("Please use #challenge-approval.");
                let role = ctx.message.guild.roles.find("name", "Challenge Approver");
        if (!ctx.message.member.roles.has(role.id)) return await ctx.send(noApprover);
        if (!ctx.args.ID) return;
        let appTch = ctx.client.channels.get("455252710732595211");
        appTch.fetchMessage(ctx.args.ID).then(async (msg) => {
            let Difficulty = ctx.args.Difficulty.toLowerCase();
            if (Difficulty == "easy") {

                rewardAmount = await ctx.db.get("challenges/easy");
            }

            if (Difficulty == "medium") {
                rewardAmount = await ctx.db.get("challenges/medium");
            }

            if (Difficulty == "hard") {
                rewardAmount = await ctx.db.get("challenges/hard");
            }
            let approved = new RichEmbed()
                .setTitle("Challenge Approved!")
                .addField("Challenge Approved By:", ctx.message.author)
                .addField("Challenge:", msg.content)
                .addField("Submitter:", msg.author)
                .addField("Difficulty:", ctx.args.Difficulty)
                .addField("Money Rewarded:", `${rewardAmount} ${botInfo.bot.currency.sign}`)
                .setColor("#7959ff")
                .setTimestamp();
            let approved2 = new RichEmbed()
            .setTitle("Challenge Approved")
            .setDescription("Your challenge has been approved.")
            .addField("Challenge:", msg.content)
            .addField("Submitter:", "You")
            .addField("Difficulty:", ctx.args.Difficulty)
            .addField("Money Rewarded:", `${rewardAmount} ${botInfo.bot.currency.sign}`)
            .setColor("#7959ff")
            .setTimestamp();
            msg.delete();
            msg.author.send(approved2);
            ctx.client.channels.get("507667784285552640").send(approved);
            let reason = "[Sapphyr Challenges] " + ctx.message.author + " approved " + ctx.args.ID + " with amount: " + rewardAmount + botInfo.bot.currency.sign;
         return await ctx.nadekoConnector.addCurrency(msg.author.id, rewardAmount, reason);
        });
    }
};
