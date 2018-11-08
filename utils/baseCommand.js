const Discord = require("discord.js");
const { Command } = require("discord.js-commando");
const datahandler = require("./datahandler.js");
const guildDatahandler = require("./guildDatahandler.js");
const globalDatahandler = require("./globalDatahandler.js");
const nadekoConnector = require("./nadekoConnector.js");
const mee6api = require("./mee6.js");
const mee6 = new mee6api(undefined, 150);
const { mongoUrl } = require("../localdata/config");
const log = require("fancy-log");

module.exports = class BaseCommand extends Command {
    constructor(client, commandInfo) {
        super(client, commandInfo);
    }

    // get parameters as though we're running a normal command
    async run(message, args, fromPattern) {

        // parse parameters into handy contextual properties before executing a task
        let context = {
            message: message,
            msg: message,
            arguments: args,
            args: args,
            fromPattern: fromPattern,
            channel: message.channel,
            user: message.author,
            react: message.react,
            dm: data => message.author.send(data),
            dmEmbed: data => message.author.send({ embed: data }),
            send: data => message.channel.send(data),
            embed: data => message.channel.send({ embed: data }),
            client: this.client
        };

        // if command is run in a guild
        if (message.guild) context.guild = message.guild;

        // if mee6 is there in the guild
        if (context.guild && context.guild.id && context.guild.member("159985870458322944")) {
            if (!mee6.checkIfExists(context.guild.id))
                mee6.addGuild(context.guild.id);

            // start caching mee6 data
            mee6.startCaching();

            // attach mee6 api commands
            context.mee6 = {
                refreshCache: () => mee6.cacheGuilds(),
                leaderboard: () => mee6.getCachedLeaderboard(context.guild.id),
                roleRewards: () => mee6.getCachedRoleRewards(context.guild.id),
                userXp: userId => mee6.getUserXp(context.guild.id, userId)
            };
        }

        // if datahandler isn't initialized
        if (typeof this.client.datahandler === "undefined") {
            this.client.datahandler = new datahandler(mongoUrl ? mongoUrl : undefined);
            await this.client.datahandler.initialize();
        }

        // attach global db to context
        context.globalDb = new globalDatahandler(this.client.datahandler);
        await context.globalDb.reload();

        // double checking if message is ran in a guild
        if (context.guild && context.guild.id) {

            // attach guildDataHandler
            context.db = new guildDatahandler(this.client.datahandler, context.guild.id);
            await context.db.reload();
            let nc = await context.db.get("nadekoconnector");

            // if nadekoconnector is enabled
            if (typeof nc === "object" && nc.enabled === true)

                // attach nadekoConnector instance to context
                context.nadekoConnector = new nadekoConnector(nc.address, nc.password);
        }

        // execute the task with the given context
        await this.task(context);

        // TODO: pre-command/post-command hooks through events
        log(`Command ${message.command.name} was executed by user ${message.author.tag} (${message.author.id}).`);
    }
};