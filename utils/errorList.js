var Discord = require("discord.js");
var fs = require("fs");
var color = require("./colors.json");

// error handling

module.exports.missingPerms = (msg, perms) => {

  let embed = new Discord.RichEmbed()
        .setAuthor(msg.author.tag)
        .setTitle("Error Occured")
        .setColor("#e60000")
        .addField("Missing permissions", perms);

    msg.channel.send(embed).then(m => m.delete(5000));
};

module.exports.nullUser = (msg, user) => {
  let embed = new Discord.RichEmbed()
    .setAuthor(msg.author.tag)
    .setTitle("Cannot find user.")
    .setColor(color.red)
    .addField("I cannot find the user.", user);

    msg.channel.send(embed).then(m=> m.delete(5000));
};

module.exports.samePerms = (msg, user, perms) => {
  let embed = new Discord.RichEmbed()
    .setAuthor(msg.author.tag)
    .setTitle("Equal Perms")
    .setColor(color.orange)
    .addField(`**${user}** has perms`, perms);

    msg.channel.send(embed).then(m=> m.delete(5000));
};

module.exports.hasRole = (msg, user, role) => {
  let embed = new Discord.RichEmbed()
    .setAuthor(msg.author.tag)
    .setTitle(`${user} has role.`)
    .setColor(color.orange)
    .addField(`**${user}** has the role:`, role);

    msg.channel.send(embed).then(m=> m.delete(5000));
};

module.exports.noReason = (channel) => {
    let embed = new Discord.RichEmbed()
        .setTitle("No reason detected.")
        .setDescription("Please supply a reason.")
        .setColor(color.red);

    msg.channel.send(embed).then(m => m.delete(5000));
};
