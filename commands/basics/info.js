const Discord = require('discord.js');

exports.run = async (client, msg, args) => {

    let botembed = new Discord.RichEmbed()
        .setDescription("Information on Sapphyr")
        .setThumbnail(client.user.displayAvatarURL)
        .addField("Bot Name", client.user.username, true)
        .addField("Created On", client.user.createdAt, true)
        .addField("Total Users", client.users.size, true)
        .addField("Total Guilds", client.guilds.size, true)
        .addField("Developer(s)", "Nef#8443, rjt#2336", true);

    msg.channel.send(botembed);
}

exports.help = {
  name: "info"
}
