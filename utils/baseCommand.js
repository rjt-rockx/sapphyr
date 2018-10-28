const Discord = require("discord.js");
const { Command } = require("discord.js-commando");
const datahandler = require("./datahandler.js");
const guildDatahandler = require("./guildDatahandler.js");

module.exports = class BaseCommand extends Command {
    constructor(client, commandInfo) {
        super(client, commandInfo);
    }

    async run(message, args, fromPattern) {
        let context = {
            message: message,
            args: args,
            fromPattern: fromPattern,
            channel: message.channel,
            user: message.member ? message.member : message.author,
            dm: data => message.author.send(data),
            react: message.react,
            embed: data => message.channel.send({ embed: data }),
            client: this.client
        };
        if (message.guild) context.guild = message.guild;
        if (typeof this.client.datahandler === "undefined") {
            this.client.datahandler = new datahandler();
            await this.client.datahandler.initialize();
        }
        if (context.guild && context.guild.id) {
            context.db = new guildDatahandler(this.client.datahandler, context.guild.id);
            await context.db.reload();
        }
        this.task(context);
    }
};