const Discord = require('discord.js');
const config = require('../../localdata/config.json');

exports.run = async (client,msg,args) => {
    let url = msg.attachments.first().url;

    if(msg.author.id !== "375772663794106368") return msg.reply("You cannot do this.");

    if(!url) return msg.reply("Specify an image.");

    client.user.setAvatar(url).then().catch(console.error);
    msg.channel.send("My profile picture has been changed successfully.");
}
exports.help = {
    name: "profile"
}
