const { Command } = require("discord.js-commando");
const Discord = require("discord.js");
module.exports = class SpfpCommand extends Command {
    constructor(client){
        super(client, {
            name: "spfp",
            group: "fun",
            memberName: "spfp",
            description: "Show the server icon."
        });
    }
    async run(msg){
        try {
        let servericonEmbed = new Discord.RichEmbed()
        .setTitle(`${msg.guild.name}'s icon.`)
        .setImage(msg.guild.iconURL);

        msg.channel.send(servericonEmbed);
        }catch(e) {
            console.error(e.stack);
        }
    }
};
