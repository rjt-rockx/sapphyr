var Discord = require("discord.js");
var color = require("../utils/colors.json");

module.exports.run = async (client, msg, args) => {

    let gIcon = message.guild.iconURL;
    let guildInfoembed = new Discord.RichEmbed()
    .setDescription(`Information on **${msg.guild.name}**`)
    .setColor(colors.green)
    .setThumbnail(gIcon)
    .addField("Guild Name", msg.guild.name)
    .addField("Created On", msg.guild.createdAt)
    .addField("You Joined", msg.member.joinedAt)
    .addField("Total Members", msg.guild.memberCount);

    msg.channel.send(guildInfoembed);
}

module.exports.help = {
  name:"guildinfo"
}
