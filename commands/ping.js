var Discord = require("discord.js");

module.exports.run = async (client, msg, args) => {

  const pm = await msg.channel.send("Testing Ping...");
    pm.edit(`Latency is ${pm.createdTimestamp-msg.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  
}
module.exports.help = {
  name: "ping"
}
