const { Command } = require("discord.js-commando"), Discord = require("discord.js");

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "This command will get the avatar of the user.",
      group: "fun",
      memberName: "avatar",
    });
  }

  run(msg) {
    let aUser = msg.mentions.members.first();
    if (!aUser) aUser = msg.author;
    return msg.channel.send(new Discord.RichEmbed().setTitle(`${aUser}'s Profile Picture`).setImage(aUser.displayAvatarURL));
  }
};
