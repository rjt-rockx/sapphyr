const { MongoClient } = require("mongodb");

class dataHandler {
    constructor(host = 27017, databaseName = "sapphyr") {
        if (typeof host === "number")
            host = "localhost:" + host;
        this._host = "mongodb://" + host;
        this._databaseName = databaseName;
        this.mongoClient = new MongoClient(this._host, { useNewUrlParser: true });
        this.initialized = false;
    }

    async initialize() {
        try {
            await this.mongoClient.connect();
            this.db = this.mongoClient.db(this._databaseName);
        }
        catch (err) {
            console.err(err);
        }
        finally {
            if (this.db)
                this.initialized = true;
        }
    }

    get isInitialized() {
        return this.initialized;
    }

    async close() {
        await this.mongoClient.close();
        this.db = null;
    }

    async getGuilds() {
        let guilds = await this.db.collection("guilds");
        return await guilds.find().toArray();
    }

    async getGuild(guild) {
        let guilds = await this.db.collection("guilds");
        return await guilds.find({ id: guild.id }).toArray();
    }

    async getOrAddGuild(guild) {
        let guildData = await this.getGuild(guild);
        if (Array.isArray(guildData) && guildData.length < 1)
            await this.addGuild(guild);
        let data = await this.getGuild(guild);
        return data[0];
    }

    async addGuild(guild) {
        let guilds = await this.db.collection("guilds");
        return await guilds.insertOne({
            id: guild.id,
            prefix: "_",
            permissions: [],
            linkdetection: { enabled: false },
            nadekoconnector: { enabled: false },
            beta: false
        });
    }

    async removeGuild(guild) {
        let guilds = await this.db.collection("guilds");
        if (typeof guild.id === "undefined") return;
        return await guilds.deleteMany({ id: guild.id });
    }

    async removeAllGuilds() {
        let guilds = await this.db.collection("guilds");
        return await guilds.deleteMany({});
    }

    async editGuild(guild, settings = {}, removeSettings = false) {
        let guilds = await this.db.collection("guilds");
        if (typeof removeSettings !== "boolean") return;
        if (removeSettings)
            return await guilds.updateOne({ id: guild.id }, { $unset: settings });
        return await guilds.updateOne({ id: guild.id }, { $set: settings });
    }
}

module.exports = dataHandler;
