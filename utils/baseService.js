const Discord = require("discord.js");

module.exports = class baseService {
    constructor(client, serviceInfo) {
        this.client = client;
        for (let [key, value] of Object.entries(serviceInfo))
            this[key] = value;
    }

    get id() {
        return this.constructor.name;
    }
};