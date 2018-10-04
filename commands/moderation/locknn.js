const Discord = require('discord.js');
const errors = require('../../utils/errorList.js');

exports.run = async (client,msg,args) => {
  try {
    let nickLocked = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
    if(nickLocked.hasPermission("MANAGE_ROLES")) return errors.higherRole(nickLocked.tag, msg.author.tag);
    if (!msg.member.hasPermission("MANAGE_ROLES")) return errors.lackPerms(msg.author.tag, "MANAGE_ROLES");
    let nickLock = msg.guild.roles.find('name', "Nickname Locked");
  }catch(e) {
    console.error(e);
  }
    if (!nickLock) {
        try {
            let nickLockRole = await msg.guild.createRole({
                name: "Nickname Locked",
                color: "#000000",
                permissions: []
            })
            msg.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(nickLockRole, {
                    CHANGE_NICKNAME: false
                });
            });
        } catch (e) {
            console.log(e.stack);
            return errors.ourSide("unknown", msg.author.tag);
        }
    }
    await nickLocked.addRole(nickLock.id);
    let lockedTrue = new Discord.RichEmbed()
        .setDescription(`${nickLocked} has had their nickname locked successfully.`);

    msg.channel.send(lockedTrue);
}
exports.help = {
    name: "locknn"
}
