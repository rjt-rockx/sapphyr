const { readdirSync } = require("fs"), { join } = require("path"), { mongoUrl } = require("../localdata/config");
const onText = str => str.replace(/\w\S*/g, txt => "on" + txt.charAt(0).toUpperCase() + txt.substr(1));

module.exports = class serviceHandler {
    constructor(client) {
        this.client = client;
        this.services = [];
        this.events = [
            "channelCreate",
            "channelDelete",
            "channelPinsUpdate",
            "channelUpdate",
            "emojiCreate",
            "emojiDelete",
            "emojiUpdate",
            "guildBanAdd",
            "guildBanRemove",
            "guildCreate",
            "guildDelete",
            "guildIntegrationsUpdate",
            "guildMemberAdd",
            "guildMemberRemove",
            "guildMemberSpeaking",
            "guildMemberUpdate",
            "guildUpdate",
            "message",
            "messageDelete",
            "messageDeleteBulk",
            "messageReactionAdd",
            "messageReactionRemove",
            "messageReactionRemoveAll",
            "messageUpdate",
            "presenceUpdate",
            "roleCreate",
            "roleDelete",
            "roleUpdate",
            "typingStart",
            "typingStop",
            "userUpdate",
            "voiceStateUpdate",
            "webhookUpdate"
        ];
    }

    checkIfValid(service) {
        return service.prototype instanceof global.utils.baseService;
    }

    addService(service) {
        if (!this.checkIfValid(service)) return;
        let serviceToAdd = new service(this.client);
        if (this.services.some(existingService => existingService.id === serviceToAdd.id)) return;
        this.services.push(serviceToAdd);
    }

    addServicesIn(folder) {
        for (let filename of readdirSync(folder))
            if (filename.match(/\.js$/) !== null && filename !== "index.js") {
                let service = require(join(folder, filename));
                this.addService(service);
            }
    }

    removeService(service) {
        this.services = this.services.filter(existingService => existingService.id !== service.id);
    }

    removeAllServices() {
        this.services = [];
    }

    async runServiceEvent(event, args) {
        for (let service of this.services)
            if (typeof service[onText(event)] === "function")
                service[onText(event)](await fetchContext(this.client, event, args));
    }

    registerEventsWithClient() {
        for (let event of this.events)
            this.client.on(event, (...args) => this.runServiceEvent(event, args));
    }
};

let fetchContext = async function (client, event, args) {
    let context = { client: client };
    await attachDatahandler(client, context);
    if (event === "channelCreate" || event === "channelDelete") {
        [context.channel] = args;
        await getGuild(context);
    }
    else if (event === "channelPinsUpdate") {
        [context.channel, context.time] = args;
        await getGuild(context);
    }
    else if (event === "channelUpdate") {
        [context.oldChannel, context.newChannel] = args;
        getChannel(context);
        await getGuild(context);
    }
    else if (event === "emojiCreate" || event === "emojiDelete") {
        [context.emoji] = args;
        await getGuild(context);
    }
    else if (event === "emojiUpdate") {
        [context.oldEmoji, context.newEmoji] = args;
        await getGuild(context);
    }
    else if (event === "guildBanAdd" || event === "guildBanRemove") {
        [context.guild, context.user] = args;
        await attachGuildDatahandler(context);
    }
    else if (event === "guildCreate" || event === "guildDelete") {
        [context.guild] = args;
        await attachGuildDatahandler(context);
    }
    else if (event === "guildMemberAdd" || event === "guildMemberRemove") {
        [context.member] = args;
        getUser(context);
        await getGuild(context);
    }
    else if (event === "guildMemberUpdate" || event === "presenceUpdate" || event === "voiceStateUpdate") {
        [context.oldMember, context.newMember] = args;
        getUser(context);
        await getGuild(context);
    }
    else if (event === "guildMemberSpeaking") {
        [context.member, context.speaking] = args;
        getUser(context);
        await getGuild(context);
    }
    else if (event === "guildUpdate") {
        [context.oldGuild, context.newGuild] = args;
        await getGuild(context);
    }
    else if (event === "message" || event === "messageDelete" || event === "messageReactionRemoveAll") {
        [context.message] = args;
        getUser(context);
        getChannel(context);
        await getGuild(context);
    }
    else if (event === "messageDeleteBulk") {
        [context.messages] = args;
        getChannel(context);
        await getGuild(context);
    }
    else if (event === "messageReactionAdd" || event === "messageReactionRemove") {
        [context.reaction, context.user] = args;
        getMessage(context);
        getChannel(context);
        await getGuild(context);
    }
    else if (event == "messageUpdate") {
        [context.oldMessage, context.newMessage] = args;
        getMessage(context);
        getChannel(context);
        await getGuild(context);
    }
    else if (event === "roleCreate" || event === "roleDelete") {
        [context.role] = args;
        await getGuild(context);
    }
    else if (event === "roleUpdate") {
        [context.oldRole, context.newRole] = args;
        context.role = context.newRole;
        await getGuild(context);
    }
    else if (event === "userUpdate") {
        [context.oldUser, context.newUser] = args;
        getUser(context);
    }
    return context;
};

let getMessage = context => {
    if (context.reaction && context.reaction.message)
        context.message = context.reaction.message;
    if (context.newMessage)
        context.message = context.newMessage;
};

let getUser = context => {
    if (!context.user) {
        if (context.member && context.member.user)
            context.user = context.member.user;
        if (context.newMember && context.newMember.user)
            context.user = context.newMember.user;
        if (context.message && context.message.author)
            context.user = context.message.author;
        if (context.newUser)
            context.user = context.newUser;
    }
};

let getChannel = context => {
    if (context.message && context.message.channel)
        context.channel = context.message.channel;
    if (context.newChannel)
        context.channel = context.newChannel;
    if (context.messages)
        context.channel = context.messages.first().channel;
};

let getGuild = async context => {
    if (!context.guild) {
        if (context.channel && context.channel.guild)
            context.guild = context.channel.guild;
        if (context.emoji && context.emoji.guild)
            context.guild = context.emoji.guild;
        if (context.newEmoji && context.newEmoji.guild)
            context.guild = context.newEmoji.guild;
        if (context.member)
            context.guild = context.member.guild;
        if (context.newMember && context.newMember.guild)
            context.guild = context.newMember.guild;
        if (context.newGuild)
            context.guild = context.newGuild;
        if (context.role)
            context.guild = context.role.guild;
    }
    if (context.guild)
        await attachGuildDatahandler(context);
};

let attachDatahandler = async (client, context) => {
    if (typeof client.datahandler === "undefined") {
        client.datahandler = new global.utils.datahandler(mongoUrl ? mongoUrl : undefined);
        await client.datahandler.initialize();
    }
    context.globalDb = new global.utils.globalDatahandler(client.datahandler);
    await context.globalDb.reload();
};

let attachGuildDatahandler = async (context) => {
    if (context.guild) {
        context.db = new global.utils.guildDatahandler(context.client.datahandler, context.guild.id);
        let nc = await context.db.get("nadekoconnector");
        if (typeof nc === "object" && nc.enabled === true)
            context.nadekoConnector = new global.utils.nadekoConnector(nc.address, nc.password);
    }
};
