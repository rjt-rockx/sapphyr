const { MongoClient } = require("mongodb");

class dataHandler {

    /**
     * @constructor Create a new dataHandler instance.
     * @param {Number} host Host of the mongodb server. Defaults to localhost:27017.
     * @param {String} databaseName Name of the database to use. Defaults to "sapphyr".
     */
    constructor(host = 27017, databaseName = "sapphyr") {
        if (typeof host === "number")
            host = "localhost:" + host;
        this._host = "mongodb://" + host;
        this._databaseName = databaseName;
        this.mongoClient = new MongoClient(this._host, { useNewUrlParser: true });
        this.initialized = false;
    }

    /**
     * Initialize the MongoClient and the database.
     */
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

    /**
     * Check if the datahandler is initialized.
     * @returns True if initialized.
     */
    get isInitialized() {
        return this.initialized;
    }

    /**
     * Close the datahandler, mongoclient and database.
     */
    async close() {
        await this.mongoClient.close();
        this.db = null;
    }

    /**
     * Get data of all guilds.
     * @returns Array of all guilds.
     */
    async getGuilds() {
        let guilds = await this.db.collection("guilds");
        return await guilds.find().toArray();
    }

    /**
     * Get data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Guild data object or empty array if not found.
     */
    async getGuild(guild) {
        let guilds = await this.db.collection("guilds");
        let results = await guilds.find({ id: guild.id }).toArray();
        return Array.isArray(results) ? results[0] : results;
    }

    /**
     * Get or add data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Guild data object.
     */
    async getOrAddGuild(guild) {
        let guildData = await this.getGuild(guild);
        if (Array.isArray(guildData) && guildData.length < 1)
            await this.addGuild(guild);
        let data = await this.getGuild(guild);
        return data[0];
    }

    /**
     * Add data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Added guild data object.
     */
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

    /**
     * Remove data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Removed guild data object.
     */
    async removeGuild(guild) {
        let guilds = await this.db.collection("guilds");
        if (typeof guild.id === "undefined") return;
        return await guilds.deleteMany({ id: guild.id });
    }

    /**
     * Remove all guild data objects from the database.
     * @returns Removed guild data object.
     */
    async removeAllGuilds() {
        let guilds = await this.db.collection("guilds");
        return await guilds.deleteMany({});
    }

    /**
     * Edit guild data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @param {Object} settings Settings to store/remove from the guild object.
     * @param {Boolean} removeSettings True if settings need to be removed.
     * @returns Updated guild data object.
     */
    async editGuild(guild, settings = {}, removeSettings = false) {
        let guilds = await this.db.collection("guilds");
        if (typeof removeSettings !== "boolean") return;
        if (removeSettings)
            return await guilds.updateOne({ id: guild.id }, { $unset: settings });
        return await guilds.updateOne({ id: guild.id }, { $set: settings });
    }
}

module.exports = dataHandler;
