const Discord = require('discord.js');
const config = require('../../localdata/config.json');
const errors = require('../../errors/errors.js');

exports.run = async (client, msg, args) => {
    try {
        if (!message.member.hasPermission("KICK_MEMBERS")) return errors.lackPerms(msg.author.tag, "KICK_MEMBERS");
        if (args[0] == "help") {
            message.reply("Usage: ;kick @user reason(s)");
            return;
        }
        let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if (!kUser) return errors.cantfindUser(kUser);
        let kReason = args.join(" ").slice(2);
        if (kUser.hasPermission("KICK_MEMBERS")) return errors.higherRole(kUser)
        let kUserPFP = kUser.displayAvatarURL;

        let kickEmbed = new Discord.RichEmbed()
            .setDescription("User has been kicked from the guild.")
            .setColor("#e56b00")
            .setThumbnail(kUserPFP)
            .addField("Kicked User", `${kUser} with ID ${kUser.id}`, true)
            .addField("Kicked By", `<@${message.author.id}> with ID ${message.author.id}`, true)
            .addField("Kicked In", message.channel, true)
            .addField("Time", message.createdAt, true)
            .addField("Reason", kReason, true);

        message.guild.member(kUser).kick(kReason);

        message.channel.send(kickEmbed);
    } catch (e) {
        console.error(e);
    }

}
exports.help = {
    name: "kick"
}
