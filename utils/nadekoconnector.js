var got = require("got");
var jwt = require("jsonwebtoken");
var config = require("../localdata/config.json");

// jwt nadekoconnector client
class NadekoConnectorClient {
    constructor(address, password) {
        this.address = address;
        this.password = password;
        this.init = false;
    }

    get initialized() {
        return this.init;
    }

    async encode(data) {
        var token = await jwt.sign(data, this.password);
        return token;
    }

    checkInitialized() {
        if (!this.init)
            throw new Error("NadekoConnector Client has not been initialized. Initialize it first before calling any function.");
    }

    async getBotInfo() {
        this.checkInitialized();
        var token = await this.encode({});
        var { body } = await got(`${this.address}/getbotinfo/${token}`);
        var info = JSON.parse(body);
        if (!info.success)
            throw new Error(info.error);
        if (info.success) {
            this.init = true;
            this.botInfo = info.bot;
            return info;
        }
    }

    async initialize() {
        await this.getBotInfo();
    }

    get currencySign() {
        this.checkInitialized();
        return this.botInfo.currency.sign;
    }

    get currencyName() {
        this.checkInitialized();
        return this.botInfo.currency.name;
    }

    get currencyPluralName() {
        this.checkInitialized();
        return this.botInfo.currency.pluralName;
    }

    get currencyData() {
        this.checkInitialized();
        return this.botInfo.currency;
    }

    get xpPerMessage() {
        this.checkInitialized();
        return this.botInfo.xp.perMessage;
    }

    get xpInterval() {
        this.checkInitialized();
        return this.botInfo.xp.interval;
    }

    get botId() {
        this.checkInitialized();
        return this.botInfo.id;
    }

    get owners() {
        this.checkInitialized();
        return this.botInfo.owners;
    }
}

exports.defaultClient = new NadekoConnectorClient(config.nadekoConnector.address, config.nadekoConnector.password);
exports.client = NadekoConnectorClient;