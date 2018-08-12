var Discord = require("discord.js");
var color = require("../utils/colors.json");

module.exports.run = async (bot, message, args) => {

    let botIcon = client.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription("Information on Sapphyr")
    .setColor(color.green)
    .setThumbnail(bIcon)
    .addField("Created On:", client.user.createdAt)
    .addField("Total Guilds:", client.guilds.size)
    .addField("Total Users:", client.users.size)
    .addField("Sapphyr's github:", '<https://github.com/rjt-rockx/sapphyr>')

    message.channel.send(botembed);
}

module.exports.help = {
  name:"info"
}
