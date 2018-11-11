const { readdirSync } = require("fs");
const { join } = require("path");
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
            "guildMemberAvailable",
            "guildMemberRemove",
            "guildMemberSpeaking",
            "guildMemberUpdate",
            "guildUnavailable",
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
        readdirSync(folder).map(filename => {
            if (filename.match(/\.js$/) !== null && filename !== "index.js") {
                let service = require(join(folder, filename));
                this.addService(service);
            }
        });
    }

    removeService(service) {
        this.services = this.services.filter(existingService => existingService.id !== service.id);
    }

    removeAllServices() {
        this.services = [];
    }

    runServiceEvent(event, args) {
        this.services.map(service => typeof service[onText(event)] === "function" ? service[onText(event)](args) : undefined);
    }

    registerEventsWithClient(eventList = this.events) {
        eventList.map(event => this.client.on(event, ...args => this.runServiceEvent(event, ...args)));
    }
};