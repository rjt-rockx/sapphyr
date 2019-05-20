const Database = require("better-sqlite3");
const { join } = require("path");
const jsonbs = require("json-bigint")({ storeAsString: true });
if (!Object.fromEntries) {
	Object.prototype.fromEntries = iterable => [...iterable].reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {});
}
const parseKeyValueObjects = array => array.length ? Object.fromEntries(array.map(({ key, value }) => [key, jsonbs.parse(value)])) : {};


class sqliteDataHandler {
	/**
     * @constructor Create a new dataHandler instance.
     * @param {Object} options Options to connect to the SQLite database.
     */
	constructor({ name = "sapphyr.db", location = "../localdata/" }) {
		this._fullPath = join(location, name);
		this.initialized = false;
		this.globalInitialized = false;
	}

	/**
     * Initialize the Database connection, create a Store table and execute Pragma statements.
     */
	initialize(client) {
		this.db = new Database(this._fullPath);
		this.db.prepare("CREATE TABLE IF NOT EXISTS Store (guildId TEXT, key TEXT, value TEXT)").run();
		this.statements = {
			getGlobalKey: this.db.prepare("SELECT key,value FROM Store WHERE guildId IS NULL AND key=@key"),
			getAllGlobalKeys: this.db.prepare("SELECT key,value FROM Store WHERE guildId IS NULL"),
			addGlobalKey: this.db.prepare("INSERT INTO Store VALUES(NULL, @key, @value)"),
			updateGlobalKey: this.db.prepare("UPDATE Store SET value=@value WHERE guildId IS NULL AND key=@key"),
			deleteGlobalKey: this.db.prepare("DELETE FROM Store WHERE guildId IS NULL AND key=@key"),
			deleteAllGlobalKeys: this.db.prepare("DELETE FROM Store WHERE guildId IS NULL"),

			getGuildKey: this.db.prepare("SELECT key,value FROM Store WHERE guildId=@id AND key=@key"),
			getAllGuildKeys: this.db.prepare("SELECT key,value FROM Store WHERE guildId=@id"),
			addGuildKey: this.db.prepare("INSERT INTO Store VALUES(@id, @key, @value)"),
			updateGuildKey: this.db.prepare("UPDATE Store SET value=@value WHERE guildId=@id AND key=@key"),
			deleteGuildKey: this.db.prepare("DELETE FROM Store WHERE guildId=@id AND key=@key"),
			deleteAllGuildKeys: this.db.prepare("DELETE FROM Store WHERE guildId=@id"),

			getAllGuildIds: this.db.prepare("SELECT DISTINCT guildId FROM Store WHERE guildId IS NOT NULL"),
			deleteAllGuilds: this.db.prepare("DELETE FROM Store WHERE guildId IS NOT NULL")
		};
		try {
			const statements = ["journal_mode=OFF", "locking_mode=NORMAL", "synchronous=OFF", "optimize"];
			statements.forEach(statement => this.db.pragma(statement));
		}
		catch (error) {
			throw new Error("Database could not be initialized.");
		}
		if (this.db)
			this.initialized = true;
		this.initializePrefixes(client);
	}

	/**
	 * Initialize the global prefix and guild prefixes once the db has loaded.
	 * @param {CommandoClient} client Client to initialize the prefixes for.
	 */
	initializePrefixes(client) {
		const globalData = this.getOrCreateGlobal();
		client.commandPrefix = globalData.prefix;
		for (const [id, guild] of client.guilds) {
			const guildData = this.getOrAddGuild({ id });
			guild.commandPrefix = guildData.prefix;
		}
	}

	/**
     * Check if the datahandler is initialized.
     * @returns True if initialized.
     */
	get isInitialized() {
		return this.initialized;
	}

	checkInitialized() {
		if (!this.initialized) throw new Error("Datahandler is not initialized. Please call initialize() first.");
	}

	/**
     * Close the datahandler and the database connection.
     */
	close() {
		if (this.db.open)
			this.db.close();
		return this;
	}

	/**
     * Get data of all guilds.
     * @returns Array of all guilds.
     */
	getGuilds() {
		this.checkInitialized();
		const guildIds = this.statements.getAllGuildIds.all().map(({ guildId }) => guildId);
		return guildIds.map(id => this.getGuild({ id }));
	}

	/**
     * Get data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Guild data object or empty array if not found.
     */
	getGuild({ id }) {
		this.checkInitialized();
		const result = this.statements.getAllGuildKeys.all({ id });
		return result.length ? parseKeyValueObjects(result) : result;
	}

	/**
     * Get or add data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Guild data object.
     */
	getOrAddGuild({ id }) {
		this.checkInitialized();
		const guildIds = this.statements.getAllGuildIds.all().map(({ guildId }) => guildId);
		if (!guildIds.includes(id)) return this.addGuild({ id });
		return this.getGuild({ id });
	}

	/**
     * Add data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Added guild data object.
     */
	addGuild({ id }) {
		this.checkInitialized();
		const data = {
			prefix: "_",
			permissions: [],
			nadekoconnector: { enabled: false }
		};
		for (const [key, value] of Object.entries(data))
			this.statements.addGuildKey.run({ id, key, value: jsonbs.stringify(value) });
		return this.getGuild({ id });
	}

	/**
     * Remove data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @returns Removed guild data object.
     */
	removeGuild({ id }) {
		this.checkInitialized();
		const guildData = this.getGuild({ id });
		this.statements.deleteAllGuildKeys.run({ id });
		return guildData;
	}

	/**
     * Remove all guild data objects from the database.
     * @returns Removed guild data objects.
     */
	removeAllGuilds() {
		this.checkInitialized();
		const guildIds = this.statements.getGuildIds.all().map(({ guildId }) => guildId);
		const guildDataObjects = guildIds.map(id => this.getGuild({ id }));
		this.statements.deleteAllGuilds.run();
		return guildDataObjects;
	}

	/**
     * Edit guild data pertaining to a specific guild.
     * @param {Object} guild A guild object with a unique "id" property.
     * @param {Object} settings Settings to store/remove from the guild object.
     * @param {boolean} removeSettings True if settings need to be removed.
     * @returns Updated guild data object.
     */
	editGuild({ id }, settings = {}, removeSettings = false) {
		this.checkInitialized();
		if (removeSettings)
			for (const key of Object.keys(settings))
				this.statements.deleteGuildKey.run({ id, key });
		else if (!removeSettings) {
			const guildData = this.getGuild({ id });
			for (const [key, value] of Object.entries(settings)) {
				if (Object.keys(guildData).includes(key))
					this.statements.updateGuildKey.run({ id, key, value: jsonbs.stringify(value) });
				else this.statements.addGuildKey.run({ id, key, value: jsonbs.stringify(value) });
			}
		}
		return this.getGuild({ id });
	}


	/**
     * Get or create a global data object.
     * @returns Global data object.
     */
	getOrCreateGlobal() {
		this.checkInitialized();
		let globalData = this.statements.getAllGlobalKeys.all();
		if (!globalData.length) {
			const data = { prefix: "_", permissions: [] };
			for (const [key, value] of Object.entries(data))
				this.statements.addGlobalKey.run({ key, value: jsonbs.stringify(value) });
			globalData = this.statements.getAllGlobalKeys.all();
		}
		if (globalData.length)
			globalData = parseKeyValueObjects(globalData);
		this.globalInitialized = true;
		return globalData;
	}

	/**
     * Edit the global data object.
     * @param {Object} settings Settings to store/remove.
     * @param {boolean} removeSettings True if settings are to be removed.
     */
	editGlobal(settings = {}, removeSettings = false) {
		this.checkInitialized();
		if (!this.globalInitialized)
			throw new Error("Global data has not been initialized. Please call initializeGlobal() first.");
		if (removeSettings)
			for (const key of Object.keys(settings))
				this.statements.deleteGlobalKey.run({ key });
		else if (!removeSettings) {
			const globalData = this.getOrCreateGlobal();
			for (const [key, value] of Object.entries(settings)) {
				if (Object.keys(globalData).includes(key))
					this.statements.updateGlobalKey.run({ key, value: jsonbs.stringify(value) });
				else this.statements.addGlobalKey.run({ key, value: jsonbs.stringify(value) });
			}
		}
		return this.getOrCreateGlobal();
	}
}

module.exports = sqliteDataHandler;