const Discord = require('discord.js');
const config = require('../../localdata/config.json');
const errors = require('../../utils/errorList.js');

exports.run = async (client, msg, args) => {
    try {
        if (!msg.member.hasPermission("KICK_MEMBERS")) return errors.lackPerms(msg.author.tag, "KICK_MEMBERS");
        if (args[0] == "help") {
            msg.reply("Usage: ;kick @user reason(s)");
            return;
        }
        let kUser = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]));
        if (!kUser) return errors.cantfindUser(kUser);
        let kReason = args.join(" ").slice(2);
        if (kUser.hasPermission("KICK_MEMBERS")) return errors.higherRole(kUser);
        let kUserPFP = kUser.displayAvatarURL;

        let kickEmbed = new Discord.RichEmbed()
            .setDescription("User has been kicked from the guild.")
            .setColor("#e56b00")
            .setThumbnail(kUserPFP)
            .addField("Kicked User", `${kUser} with ID ${kUser.id}`, true)
            .addField("Kicked By", `<@${msg.author.id}> with ID ${msg.author.id}`, true)
            .addField("Kicked In", msg.channel, true)
            .addField("Time", msg.createdAt, true)
            .addField("Reason", kReason, true);

        msg.guild.member(kUser).kick(kReason);

        msg.channel.send(kickEmbed);
    } catch (e) {
        console.error(e);
    }

}
exports.help = {
    name: "kick"
}
