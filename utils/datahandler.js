const { MongoClient } = require("mongodb");

class dataHandler {
    constructor(host = "localhost:27017", databaseName = "sapphyr") {
        if (typeof host === "number")
            host = "localhost:" + host;
        this._host = "mongodb://" + host;
        this._databaseName = databaseName;
        this.client = new MongoClient(this._host, { useNewUrlParser: true });
    }

    async initialize() {
        await this.client.connect();
        this.db = this.client.db(this._databaseName);
    }

    async close() {
        await this.client.close();
        this.db = null;
    }

    async getGuilds() {
        let guilds = await this.db.collection("guilds");
        return await guilds.find().toArray();
    }

    async getGuild(guild) {
        let guilds = await this.db.collection("guilds");
        return await guilds.find({ guildId: guild.id }).toArray();
    }

    async addGuild(guild) {
        let guilds = await this.db.collection("guilds");
        return await guilds.insertOne({
            guildId: guild.id,
            prefix: "_",
            permissions: [],
            linkDetection: { enabled: false },
            beta: false
        });
    }

    async removeGuild(guild) {
        let guilds = await this.db.collection("guilds");
        return await guilds.deleteMany({ guildId: guild.id });
    }

    async editGuild(guild, settings = {}) {
        let guilds = await this.db.collection("guilds");
        return await guilds.updateOne({ guildId: guild.id }, { $set: settings });
    }
}

module.exports = dataHandler;

// async function test() {
//     let x = new dataHandler();
//     await x.initialize();
//     await x.addGuild({ id: 12345 });
//     await x.getGuilds();
//     await x.editGuild({ id: 12345 }, { prefix: ">" });
//     await x.getGuilds();
//     await x.removeGuild({ id: 12345 });
//     await x.getGuilds();
//     await x.close();
// }
// test();
