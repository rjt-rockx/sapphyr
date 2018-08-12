var Discord = require("discord.js");
var errors = require("../utils/errorList.js");
var color = require("../utils/colors.json");

module.exports.run = async (client, msg, args) => {

  let pUser = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]));

  if(!pUser) return errors.nullUser(msg, pUser);
  
  let aEmbed = new Discord.RichEmbed()
  .setColor(color.green)
  .setDescription(`${pUser}'s Avatar:`)
  .setImage(`${pUser.user.displayAvatarURL}`)
  .setFooter(`Command executed by ${msg.author.tag}`);

  msg.channel.send(aEmbed);

}
module.exports.help = {
  name: "pfp"
}
