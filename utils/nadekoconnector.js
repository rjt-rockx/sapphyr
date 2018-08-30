var got = require("got");
var jwt = require("jsonwebtoken");

class NadekoConnectorClient {
    constructor(address, password) {
        this.address = address;
        this.password = password;
    }

    async getData(endpoint, data) {
        let token = jwt.sign(data, this.password);
        let { body } = await got(`${this.address}/${endpoint}/${token}`);
        return JSON.parse(body);
    }

    async getBotInfo() {
        return await this.getData("getBotInfo", {});
    }

    async getCurrency(userId) {
        return await this.getData("getCurrency", { userId: userId });
    }

    async addCurrency(userId, currency, reason) {
        return await this.getData("addCurrency", { userId: userId, currency: currency, reason: reason });
    }

    async getGuildXp(userId, guildId) {
        return await this.getData("getGuildXp", { userId: userId, guildId: guildId });
    }

    async setGuildXp(userId, guildId, xp, awardedXp) {
        return await this.getData("getGuildXp", { userId: userId, guildId: guildId, xp: xp, awardedXp: awardedXp });
    }
}

module.exports = NadekoConnectorClient;