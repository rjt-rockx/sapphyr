var { Command } = require("discord.js-commando");
var Discord = require('discord.js');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: "avatar",
            description: "gets user avatar",
            group: "fun",
            memberName: "avatar"
        });
    }

    async run(msg) {
      let aUser = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]));
      if(!aUser) {
        aUser = msg.author.tag;
      }
      let avatarEmbed = new Discord.RichEmbed()
      .setTitle(`${aUser}'s Profile Picture'`)
      .setImage(aUser.displayAvatarURL);
      return msg.channel.send(avatarEmbed);
    }
};
exports.help = {
  name: "avatar"
}
