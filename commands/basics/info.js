const { version } = require("discord.js");
const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const { Command } = require("discord.js-commando");

module.exports = class InfoCommand extends Command {
  constructor(client){
    super(client, {
      name: "info",
      group: "basics",
      description: "Show bot info.",
      memberName: "info"
    });
  }
  async run(msg){
    var cam = "Sep 29 2018";
    try {
  let mag = msg;
  let ping = parseInt(msg.createdTimestamp - mag.createdTimestamp);
  msg.delete();

  let memAverage = ~~(2e-1 + process.memoryUsage().heapUsed / 1024 / 1024);
  const duration = moment.duration(this.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  let time = moment().format("ddd, Do of MMM @ HH:mm:ss");

    const embed = new Discord.RichEmbed()
    .setDescription("Information on Sapphyr")
    .addField("Name", this.client.user.tag, true)
    .addField("• Uptime", duration, true)
    .addField("• Total Users", this.client.users.size, true)
    .addField("• Total Servers", this.client.guilds.size, true)
    .addField("• Total Channels", this.client.channels.size, true)
    .addField("• Discord.js", "11.4.2", true)
    .addField("• NodeJS", process.version, true)
    .addField("• Contributors", "Nef#8443 and rjt#2336", true)
    .addField("• Mem Usage", `${memAverage} MB`, true)
    .addField("• Ping",  2e-1 + 100 * ping / 100, true)
    .addField("• Created On", cam, true)
    .setFooter(`Requested by ${msg.author.tag}`)
    .setTimestamp();

    msg.channel.send(embed);
  }catch(e) {
    console.error(e.stack);
  }
  }
};
