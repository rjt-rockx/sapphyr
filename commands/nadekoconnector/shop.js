var { Command } = require('discord.js-commando');
var { RichEmbed } = require('discord.js');

module.exports = class ShopCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: 'shop',
            memberName: 'shop',
            group: 'nadekoconnector',
            description: 'Open the shop.'
        })
    }
    async task(ctx) {
        let embed = new RichEmbed()
        .setTitle("Shop")
        .addField("#1 - 2500:dollar:", "You will get **Balanced Green** role.", true)
        .addField("#2 - 2500:dollar:", "You will get **Brilliant Red** role.", true)
        .addField("#3 - 2500:dollar:", "You will get **Brave Purple** role.", true)
        .addField("#4 - 2500:dollar:", "You will get **Sunny Yellow** role.", true)
        .addField("#5 - 2500:dollar:", "You will get **Rock Black** role.", true)
        .addField("#6 - 2500:dollar:", "You will get **Firey Orange** role.", true)
        .addField("#7 - 2500:dollar:", "You will get **Raged Red** role.", true)
        .addField("#8 - 2500:dollar:", "You will get **Pretty Pink** role.", true)
        .addField("#9 - 2500:dollar:", "You will get **Sky Blue** role.", true)
        .addField("#10 - 2500:dollar:", "You will get **Natural Green** role.", true)
        .addField("#11 - 2500:dollar:", "You will get **Passionate Purple** role.", true);
        
    ctx.send(embed);
    }
}
