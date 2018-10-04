const Discord = require("discord.js");
const ms = require("ms");
const fs = require("fs");

exports.run = async (client, msg, args) => {
  if(!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You can't do that, buddy.");
  let tomute = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]));
  if(!tomute) return msg.reply("Couldn't find user.");
  if(tomute.hasPermission("MANAGE_MESSAGES")) return msg.reply("Can't mute them!");
  let muterole = msg.guild.roles.find(`name`, "Muted");
  let tmutereason;
  if(!muterole){
    try{
      muterole = await msg.guild.createRole({
        name: "Muted",
        color: "#000000",
        permissions:[]
      })
      msg.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(muterole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      });
    }catch(e){
      console.log(e.stack);
    }
  }
  let mutetime = args[1];
  if(!mutetime) return msg.reply("You didn't specify a time!");

try {
  await(tomute.addRole(muterole.id));
  msg.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`);

  setTimeout(function(){
    tomute.removeRole(muterole.id);
    msg.channel.send(`<@${tomute.id}> has been unmuted!`);
  }, ms(mutetime));
}catch(e){console.error(e);}

}

exports.help = {
  name: "tempmute"
}
