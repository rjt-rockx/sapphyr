const Discord = require("discord.js");
const { Command } = require("discord.js-commando");
const datahandler = require("./datahandler.js");
const guildDatahandler = require("./guildDatahandler.js");
const globalDatahandler = require("./globalDatahandler.js");
const nadekoConnector = require("./nadekoConnector.js");
const mee6api = require("./mee6.js");
const mee6 = new mee6api();
const { mongoUrl } = require("../localdata/config");
const log = require("fancy-log");

mee6.startCaching();
module.exports = class BaseCommand extends Command {
    constructor(client, commandInfo) {
        super(client, commandInfo);
    }

    async run(message, args, fromPattern) {
        let context = {
            message: message,
            msg: message,
            arguments: args,
            args: args,
            fromPattern: fromPattern,
            channel: message.channel,
            user: message.member ? message.member : message.author,
            dm: data => message.author.send(data),
            send: data => message.channel.send(data),
            react: message.react,
            embed: data => message.channel.send({ embed: data }),
            client: this.client
        };
        if (message.guild) context.guild = message.guild;
        if (context.guild && context.guild.id && context.guild.member("159985870458322944")) { // if mee6 is in the guild
            if (!mee6.checkIfExists(context.guild.id))
                mee6.addGuild(context.guild.id);
            context.mee6 = {
                refreshCache: () => mee6.cacheGuilds(),
                leaderboard: () => mee6.getCachedLeaderboard(context.guild.id),
                roleRewards: () => mee6.getCachedRoleRewards(context.guild.id),
                userXp: userId => mee6.getUserXp(context.guild.id, userId)
            };
        }
        if (typeof this.client.datahandler === "undefined") {
            this.client.datahandler = new datahandler(mongoUrl ? mongoUrl : undefined);
            await this.client.datahandler.initialize();
            context.globalDb = new globalDatahandler(this.client.datahandler);
            await context.globalDb.reload();
        }
        if (context.guild && context.guild.id) {
            context.db = new guildDatahandler(this.client.datahandler, context.guild.id);
            await context.db.reload();
        }
        if (context.db) {
            let nc = await context.db.get("nadekoconnector");
            if (typeof nc === "object" && nc.enabled === true)
                context.nadekoConnector = new nadekoConnector(nc.address, nc.password);
        }
        await this.task(context);
        log(`Command ${message.command.name} was executed by user ${message.author.tag} (${message.author.id}).`);
    }
};