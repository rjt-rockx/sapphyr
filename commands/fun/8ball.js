const { Command } = require("discord.js-commando"), Discord = require("discord.js");
const choices = ["Yes.", "No.", "Maybe.", "Studies agree.", "Studies do not agree.", "Yup.", "Indeed.", "For sure.",
  "Umm...no.", "Nope.", "Really, no, just no.", "No u.", "Nah."];
module.exports = class EightBallCommand extends Command {
  constructor(client) {
    super(client, {
      name: "8ball",
      group: "fun",
      memberName: "8ball",
      description: "Bot replies with random yes or no response in many varients.",
      examples: ["_8ball is sapphyr awesome?"],
    });
  }
  run(msg) {
    msg.channel.send(new Discord.RichEmbed().setDescription(choices[Math.floor(Math.random() * choices.length)]));
  }
};
