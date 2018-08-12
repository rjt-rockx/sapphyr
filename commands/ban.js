var Discord = require("discord.js");
var errors = require("../utils/errorList.js");
var color = require("../utils/colors.json");

module.exports.run = async (client, msg, args) => {

   msg.delete();
    if(!msg.member.hasPermission("BAN_MEMBERS")) return errors.missingPerms(msg, "BAN_MEMBERS");
    if(args[0] == "help"){
      msg.reply("Usage: s.ban @someone reason");
      return;
    }
    let bUser = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]));
    if(!bUser) return errors.nullUser(msg.channel);
    let breason = args.join(" ").slice(1);
    if(!breason) return errors.noReason(msg.channel);
    if(bUser.hasPermission("BAN_MEMBERS")) return errors.samePerms(msg, bUser, "BAN_MEMBERS");
    let bUserp = bUser.avatarURL;

    let bEmbed = new Discord.RichEmbed()
    .setDescription(`${bUser} has successfully been banned from the guild.:white_check_mark:`)
    .setColor(color.green);

   await msg.guild.member(bUser).ban(breason);
         msg.channel.send(bEmbed);

}

module.exports.help = {
  name: "ban"
}


