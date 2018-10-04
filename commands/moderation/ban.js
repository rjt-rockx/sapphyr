const Discord = require('discord.js');
const { Command } = require('discord.js-commando');
// might not work as im new with ze commando.
module.exports = class banCommand extends Command {
  constructor(client){
    super(client, {
      name: "ban",
      group: "moderation",
      description: "ban a guild member",
      memberName: "ban",
      args: [
             {
               key: 'user',
               prompt: 'The user to ban.',
               type: 'user'
             },
             {
               key: 'content',
               prompt: 'Ban Reason',
               type: 'string'
             },
             {
               key: 'time',
               prompt: 'ban time',
               type: 'string'
             }
           ]
         });
       }
   async run(msg, user, content, time){

    let guild = this.msg.guild.name;
    if(!time) {
      time = "N/A";
    }
    if(user.hasPermission("BAN_MEMBERS")) return msg.reply("You cannot ban a user with a higher role.");
    if(!this.msg.member.hasPermission("BAN_MEMBERS")) return msg.reply("You cannot do this.");
    let banEmbed = new RichEmbed()
    .setTitle("User Bannned.")
    .addField("Banned User:", user)
    .addField("Action By:", this.msg.author.tag)
    .addField("Reason:", content)
    .addField("Banned for:", time)
    .setFooter(Date.now() + " | " + this.msg.id);

    await msg.guild.ban(user).then(msg.guild.channels.find("name", "auttaja-modlogs").send(banEmbed));
    let youvebeenbanned = new RichEmbed()
    .setTitle("Banned")
    .setDescription(`You have been banned from ${guild} with reason ${content}.`)
    user.send(youvebeenbanned);
  }
}
exports.help = {
  name: "ban"
}
