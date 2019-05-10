const File = require("./file.js");
const Database = require("better-sqlite3");

class Connector {

	/**
	 * Creates a new Connector for the specified configuration.
	 * @param {String} databasePath Path to the database (.db)
	 * @param {String} credentialsPath Path to the credentials file (.json)
	 * @param {[String]} [disabledEndpoints=[]] Endpoints to disable.
	 * @param {Boolean} readOnly Whether the connector should be read-only.
	 */
	constructor(databasePath, credentialsPath, disabledEndpoints, readOnly) {
		this.db = new Database(databasePath, { memory: false, readonly: Boolean(readOnly), fileMustExist: true });
		this.credentials = new File(credentialsPath, err => { throw err; }).read();

		this._endpoints = [
			"getBotInfo",
			"getTables",
			"getFields",
			"execSql",
			"getCurrency",
			"setCurrency",
			"addCurrency",
			"subtractCurrency",
			"createTransaction",
			"getTransactions",
			"getGuildRank",
			"getGuildXp",
			"setGuildXp",
			"addGuildXp",
			"subtractGuildXp",
			"awardGuildXp",
			"getGuildXpLeaderboard",
			"getGuildXpRoleRewards",
			"getGuildXpCurrencyRewards",
			"getGlobalRank",
			"getGlobalXp",
			"getGlobalXpLeaderboard",
			"getClubLeaderboard",
			"getClubInfo",
			"getClubInfoByUser",
			"getClubMembers"
		];

		if (readOnly) disabledEndpoints = disabledEndpoints.concat(this._endpoints.filter(endpoint => !endpoint.startsWith("get")));
		this._disabledEndpoints = [...new Set(disabledEndpoints)];
		this._init = false;
	}

	/**
	 * Gets all endpoints implemented in the Connector.
	 * @return {[String]} Array of endpoints.
	 */
	get allEndpoints() {
		return this._endpoints;
	}

	/**
	 * Gets available endpoints for the current Connector instance.
	 * @return {[String]} Array of available endpoints.
	 */
	get endpoints() {
		return this._endpoints.filter(endpoint => !this._disabledEndpoints.includes(endpoint));
	}

	/**
	 * Gets disabled endpoints for the current Connector instance.
	 * @return {[String]} Array of disabled endpoints.
	 */
	get disabledEndpoints() {
		return this._disabledEndpoints;
	}
	/**
	 * Sets disabled endpoints for the current Connector instance.
	 * @param {[String]} disabledEndpoints Array of disabled endpoints.
	 */
	set disabledEndpoints(disabledEndpoints) {
		this._disabledEndpoints = [...new Set(disabledEndpoints)];
	}

	/**
	 * Get the initialization state of the connector.
	 * @returns {Boolean} Whether the connector is initialized or not.
	 */
	get initialized() {
		return this._init;
	}

	/**
	 * Calculate levels gained from a given amount of XP.
	 * @param {Number} xp XP to calculate level for.
	 * @returns {Object} Level information.
	 */
	calcLevel(xp) {
		if (typeof xp !== "number" || xp < 0)
			throw new Error("XP must be a valid numerical value.");
		let level = 0,
			required = 0;
		while (true) {
			required = 36 + (9 * level);
			if (xp >= required) {
				xp -= required;
				level++;
			}
			if (xp < required)
				break;
		}
		return { level, levelXp: xp, requiredXp: required + 9 };
	}

	/**
	 * Check if the connector has been initialized or not.
	 */
	checkInitialized() {
		if (!this._init)
			throw new Error("Connector not initialized. Please initialize it by calling initialize().");
	}

	/**
	 * Check if the endpoint has been disabled.
	 */
	checkEndpoint(endpoint) {
		this.checkInitialized();
		if (this._disabledEndpoints.map(endpoint => endpoint.toLowerCase()).includes(endpoint.toLowerCase()))
			throw new Error("Endpoint disabled.");
	}

	/**
	 * Initialize the connector.
	 */
	initialize() {
		try {
			const statements = ["journal_mode=OFF", "locking_mode=NORMAL", "synchronous=OFF", "optimize"];
			statements.forEach(statement => this.db.pragma(statement));
		}
		catch (error) {
			throw new Error("Database could not be initialized.");
		}
		this._init = true;
		return this;
	}

	/**
	 * Gets info about the bot.
	 * @returns {Object} Info about the bot.
	 */
	getBotInfo() {
		try {
			this.checkEndpoint("getBotInfo");
			const bet = this.db.prepare("select MinBet as 'minimum', MaxBet as 'maximum' from BotConfig").get();
			const currency = this.db.prepare("select CurrencySign as 'sign', CurrencyName as 'name', CurrencyPluralName as 'pluralname' from BotConfig").get();
			const generation = this.db.prepare("select CurrencyGenerationChance as 'chance', CurrencyGenerationCooldown as 'cooldown', CurrencyDropAmount as 'minimumDrop', CurrencyDropAmountMax as 'maximumDrop' from BotConfig").get();
			const timely = this.db.prepare("select TimelyCurrency as 'amount', TimelyCurrencyPeriod as 'timeout' from BotConfig").get();
			const xp = this.db.prepare("select XpPerMessage as 'perMessage', XpMinutesTimeout as 'timeout' from BotConfig").get();
			return {
				id: this.credentials.ClientId,
				owners: this.credentials.OwnerIds,
				currency: {
					...currency,
					bet, generation, timely
				},
				xp
			};
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Gets the tables present in the database.
	 * @returns {Object} Array of table names.
	 */
	getTables() {
		try {
			this.checkEndpoint("getTables");
			const tables = this.db.prepare("select name from sqlite_master where type='table'").all().map(table => table.name).sort();
			if (!tables) throw new Error("Unable to list tables.");
			this.tables = tables;
			return { tables };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Gets fields present in the specified table.
	 * @param {String} table Name of the table.
	 * @returns {Object} Array of field names.
	 */
	getFields(table) {
		try {
			this.checkEndpoint("getFields");
			if (!this.tables) this.tables = this.getTables().tables;
			if (!this.tables.includes(table)) throw new Error("Table not present.");
			const fields = this.db.prepare(`select * from ${table}`).get();
			return { fields: Object.keys(fields) };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Execute an SQL query and return the rows.
	 * @param {String} command The SQL command to execute.
	 * @returns {Object} Result of the command, array of rows if multiple rows were affected or a single JSON object if a single row was affected.
	 */
	execSql(command) {
		try {
			this.checkEndpoint("execSql");
			const rows = this.db.prepare(command).all();
			return { rows, affected: rows.length };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Check if a Discord guild exists in the database.
	 * @param {String} guildId ID of the Discord guild.
	 */
	checkIfGuildExists(guildId) {
		try {
			if (typeof guildId !== "string") throw new Error("Guild IDs must be provided as strings.");
			const guild = this.db.prepare(`select Id from GuildConfigs where GuildId=${guildId}`).get();
			if (!guild) throw new Error("Guild not found.");
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Check if a Discord user exists in the database.
	 * @param {String} userId ID of the Discord user.
	 */
	checkIfUserExists(userId) {
		try {
			if (typeof userId !== "string") throw new Error("User IDs must be provided as strings.");
			const user = this.db.prepare(`select Id from DiscordUser where UserId=${userId}`).get();
			if (!user) throw new Error("User not found.");
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Check if currency amount is properly specified.
	 * @param {String} currency Currency amount.
	 */
	checkIfValidCurrency(currency) {
		try {
			if (typeof currency !== "number")
				throw new Error("Currency amount must be a number.");
			if (currency >= Number.MAX_SAFE_INTEGER || currency <= Number.MIN_SAFE_INTEGER)
				throw new Error("Currency amount exceeds maximum safe integer limits.");
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get the currency of a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @returns {Object} Balance info about the specified user.
	 */
	getCurrency(userId) {
		try {
			this.checkEndpoint("getCurrency");
			this.checkIfUserExists(userId);
			const info = this.db.prepare(`select cast(UserId as text) as 'userId', CurrencyAmount as 'currency' from DiscordUser where UserId = ${userId}`).get();
			if (!info) throw new Error("Unable to fetch currency.");
			return info;
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Set the currency of a Discord user. NOT RECOMMENDED! Use addCurrency instead for normal transactions.
	 * @param {String} userId ID of the Discord user.
	 * @param {Number} currency Currency amount to be set.
	 * @returns {Object} Balance info about the specified user.
	 */
	setCurrency(userId, currency) {
		try {
			this.checkEndpoint("setCurrency");
			this.checkIfUserExists(userId);
			this.checkIfValidCurrency(currency);
			const { changes } = this.db.prepare(`update DiscordUser set CurrencyAmount = ${currency} where UserId=${userId}`).run();
			if (!changes) throw new Error("Unable to update currency.");
			return { userId, currency };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Add currency to a user.
	 * @param {String} userId ID of the Discord user.
	 * @param {Number} currency Currency amount to be added.
	 * @param {String} reason Reason for the transaction.
	 * @returns {Object} Balance info about the specified user.
	 */
	addCurrency(userId, currency, reason) {
		try {
			this.checkEndpoint("addCurrency");
			this.checkIfUserExists(userId);
			this.checkIfValidCurrency(currency);
			const userCurrency = this.db.prepare(`update DiscordUser set CurrencyAmount = CurrencyAmount + ${Math.abs(currency)} where UserId = ${userId}`).run();
			if (!userCurrency.changes) throw new Error("Unable to add currency to this user.");
			const createdTransaction = this.createTransaction(userId, Math.abs(currency), reason);
			if (!createdTransaction) throw new Error("Unable to create a currency transaction for the user.");
			if (userId !== this.credentials.ClientId)
				this.subtractCurrency(this.credentials.ClientId, currency, reason);
			return this.getCurrency(userId);
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Subtract currency from a user.
	 * @param {String} userId ID of the Discord user.
	 * @param {Number} currency Currency amount to be subtracted.
	 * @param {String} reason Reason for the transaction.
	 * @returns {Object} Balance info about the specified user.
	 */
	subtractCurrency(userId, currency, reason) {
		try {
			this.checkEndpoint("subtractCurrency");
			this.checkIfUserExists(userId);
			this.checkIfValidCurrency(currency);
			const { currency: oldCurrency } = this.getCurrency(userId);
			if (Math.abs(currency) > oldCurrency && userId !== this.credentials.ClientId)
				throw new Error("User does not have the specified currency.");
			const userCurrency = this.db.prepare(`update DiscordUser set CurrencyAmount =  CurrencyAmount - ${Math.abs(currency)} where UserId = ${userId}`).run();
			if (!userCurrency.changes) throw new Error("Unable to subtract currency from this user.");
			const createdTransaction = this.createTransaction(userId, -1 * Math.abs(currency), reason);
			if (!createdTransaction) throw new Error("Unable to create a currency transaction for the user.");
			if (userId !== this.credentials.ClientId)
				this.addCurrency(this.credentials.ClientId, currency, reason);
			return this.getCurrency(userId);
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Create a transaction for a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {Number} currency Amount added to or subtracted from the user.
	 * @param {String} reason Reason for the transaction.
	 * @returns {Object} Transaction info.
	 */
	createTransaction(userId, currency, reason) {
		try {
			this.checkEndpoint("createTransaction");
			this.checkIfValidCurrency(currency);
			const dateAdded = new Date().toISOString().replace(/[TZ]/g, " ");
			const createdTransaction = this.db.prepare(`insert into CurrencyTransactions (UserId, Amount, Reason, DateAdded) values (${[userId, currency, reason, dateAdded].join(",")})`).run();
			if (!createdTransaction) throw new Error("Unable to create a transaction.");
			return { userId, transactionId: createdTransaction.lastInsertRowid };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get transactions of a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {Number} startPosition Start position/offset of transactions.
	 * @param {Number} items Items per page.
	 * @returns {Object} Transactions.
	 */
	getTransactions(userId, startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getTransactions");
			this.checkIfUserExists(userId);
			const transactions = this.db.prepare(`select Id as 'transactionId', Amount as 'amount', Reason as 'reason', DateAdded as 'dateAdded' from CurrencyTransactions where UserId = ${userId} order by Id desc limit ${items} offset ${startPosition}`).all();
			if (!transactions.length) throw new Error("No transactions found for this user.");
			return transactions;
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get ranking of a Discord user in a specific guild.
	 * @param {String} userId ID of the Discord user.
	 * @param {String} guildId ID of the Discord guild.
	 * @returns {Object} Rank info.
	 */
	getGuildRank(userId, guildId) {
		try {
			this.checkEndpoint("getGuildRank");
			this.checkIfUserExists(userId);
			this.checkIfGuildExists(guildId);
			const guildRankings = this.db.prepare(`select cast(UserId as text) as 'id' from UserXpStats where GuildId=${guildId} order by Xp+AwardedXp desc`).all().map(user => user.id);
			if (!guildRankings.length) throw new Error("Unable to get guild rankings.");
			const rank = guildRankings.indexOf(userId) > -1 ? guildRankings.indexOf(userId) + 1 : guildRankings.length;
			return { userId, rank };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get the guild XP of a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {String} guildId ID of the Discord guild.
	 * @returns {Object} Information about the user's XP.
	 */
	getGuildXp(userId, guildId) {
		try {
			this.checkEndpoint("getGuildXp");
			this.checkIfUserExists(userId);
			this.checkIfGuildExists(guildId);
			const xpInfo = this.db.prepare(`select Xp, AwardedXp from UserXpStats where UserId = ${userId} and GuildId = ${guildId}`).get();
			if (!xpInfo) throw new Error("Unable to get XP info of the given user for this guild.");
			const rankInfo = this.getGuildRank(userId, guildId);
			if (!rankInfo) throw new Error("Unable to get rank.");
			const levelInfo = this.calcLevel(xpInfo.Xp + xpInfo.AwardedXp);
			if (!levelInfo) throw new Error("Unable to calculate level.");
			return {
				guildXp: xpInfo.Xp,
				awardedXp: xpInfo.AwardedXp,
				totalXp: xpInfo.Xp + xpInfo.AwardedXp,
				...levelInfo,
				rank: rankInfo.rank
			};
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Set the guild XP of a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {String} guildId ID of the Discord guild.
	 * @param {String} xp XP of the Discord user.
	 * @param {String} awardedXp XP awarded to the Discord user.
	 * @returns {Object} Information about the user's guild XP.
	 */
	setGuildXp(userId, guildId, xp, awardedXp) {
		try {
			this.checkEndpoint("setGuildXp");
			this.checkIfUserExists(userId);
			this.checkIfGuildExists(guildId);
			const guildXp = this.db.prepare(`update UserXpStats set Xp=${xp}, AwardedXp=${awardedXp} where UserId=${userId} and GuildId=${guildId}`).run();
			if (!guildXp.changes) throw new Error("Unable to update guild XP.");
			const xpInfo = this.getGuildXp(userId, guildId);
			if (!xpInfo) throw new Error("Unable to fetch XP info.");
			return xpInfo;
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Add guild XP to a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {String} guildId ID of the Discord guild.
	 * @param {String} xp XP to be added.
	 * @returns {Object} Information about the user's guild XP.
	 */
	addGuildXp(userId, guildId, xp) {
		try {
			this.checkEndpoint("addGuildXp");
			this.checkIfUserExists(userId);
			this.checkIfGuildExists(guildId);
			const guildXp = this.db.prepare(`update UserXpStats set AwardedXp = AwardedXp + ${Math.abs(xp)} where UserId = ${userId} and GuildId = ${guildId}`).run();
			if (!guildXp.changes) throw new Error("Unable to add guild Xp to this user.");
			return this.getGuildXp(userId, guildId);
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Subtract guild XP from a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {String} guildId ID of the Discord guild.
	 * @param {String} xp XP to be subtracted.
	 * @returns {Object} Information about the user's guild XP.
	 */
	subtractGuildXp(userId, guildId, xp) {
		try {
			this.checkEndpoint("subtractGuildXp");
			this.checkIfUserExists(userId);
			this.checkIfGuildExists(guildId);
			const guildXp = this.db.prepare(`update UserXpStats set AwardedXp = AwardedXp - ${Math.abs(xp)} where UserId = ${userId} and GuildId = ${guildId}`).run();
			if (!guildXp.changes) throw new Error("Unable to subtract guild Xp from this user.");
			return this.getGuildXp(userId, guildId);
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Award guild XP to a Discord user.
	 * @param {String} userId ID of the Discord user.
	 * @param {String} guildId ID of the Discord guild.
	 * @param {String} xp XP to be awarded.
	 * @returns {Object} Information about the user's guild XP.
	 */
	awardGuildXp(userId, guildId, xp) {
		try {
			this.checkEndpoint("awardGuildXp");
			return xp > 0 ? this.addGuildXp(userId, guildId, xp) : this.subtractGuildXp(userId, guildId, xp);
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get XP leaderboard of a Discord guild.
	 * @param {String} guildId ID of the guild to get XP leaderboard of.
	 * @param {Number} startPosition Start position/offset of the page.
	 * @param {Number} items Items per page.
	 * @returns {Object} Leaderboard page.
	 */
	getGuildXpLeaderboard(guildId, startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getGuildXpLeaderboard");
			this.checkIfGuildExists(guildId);
			const leaderboard = this.db.prepare(`select cast(UserId as text) as 'userId', Xp as 'xp', AwardedXp as 'awardedXp' from UserXpStats where GuildId=${guildId} order by (xp + awardedXp) desc limit ${items} offset ${startPosition}`).all();
			if (!leaderboard.length) throw new Error("Unable to fetch guild XP leaderboard.");
			return leaderboard.map((user, rank) => ({
				...this.calcLevel(user.xp + user.awardedXp),
				...user, rank: startPosition + rank + 1
			}));
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get XP role rewards of a Discord guild.
	 * @param {String} guildId ID of the guild to get XP role rewards of.
	 * @param {Number} startPosition Start position/offset of the page.
	 * @param {Number} items Items per page.
	 * @returns {Object} Role rewards page.
	 */
	getGuildXpRoleRewards(guildId, startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getGuildXpRoleRewards");
			this.checkIfGuildExists(guildId);
			const rewards = this.db.prepare(`select a.DateAdded as 'dateAdded', a.Level as 'level', cast (a.RoleId as text) as 'roleId' from XpRoleReward a, XpSettings b, GuildConfigs c where a.XpSettingsId = b.Id AND b.GuildConfigId = c.Id AND c.GuildId = ${guildId} order by a.Level asc limit ${items} offset ${startPosition}`).all();
			if (!rewards.length) throw new Error("Unable to fetch role rewards.");
			return rewards;
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get XP currency rewards of a Discord guild.
	 * @param {String} guildId ID of the guild to get XP currency rewards of.
	 * @param {Number} startPosition Start position/offset of the page.
	 * @param {Number} items Items per page.
	 * @returns {Object} Currency rewards page.
	 */
	getGuildXpCurrencyRewards(guildId, startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getGuildXpCurrencyRewards");
			this.checkIfGuildExists(guildId);
			const rewards = this.db.prepare(`select a.DateAdded as 'dateAdded', a.Level as 'level', a.Amount as 'amount' from XpCurrencyReward a, XpSettings b, GuildConfigs c where a.XpSettingsId = b.Id AND b.GuildConfigId = c.Id AND c.GuildId = ${guildId} order by a.Level asc limit ${items} offset ${startPosition}`).all();
			if (!rewards.length) throw new Error("Unable to fetch currency rewards.");
			return rewards;
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get global ranking of a Discord user.
	 * @param {String} userId ID of the user to get global ranking of.
	 * @returns {Object} Rank info.
	 */
	getGlobalRank(userId) {
		try {
			this.checkEndpoint("getGlobalRank");
			this.checkIfUserExists(userId);
			const globalRankings = this.db.prepare("select cast(UserId as text) as 'id' from DiscordUser order by TotalXp desc").all().map(user => user.id);
			const rank = globalRankings.indexOf(userId) > -1 ? globalRankings.indexOf(userId) + 1 : globalRankings.length;
			return { userId, rank };
		}
		catch (error) {
			return { error };
		}
	}

	/**
 	* Get the global XP of a Discord user.
 	* @param {String} userId ID of the Discord user.
 	* @returns {Object} Information about the user's global XP.
 	*/
	getGlobalXp(userId) {
		try {
			this.checkEndpoint("getGlobalXp");
			this.checkIfUserExists(userId);
			const { globalXp } = this.db.prepare(`select TotalXp as 'globalXp' from DiscordUser where UserId=${userId}`).get();
			if (!globalXp) throw new Error("Unable to get global Xp for this user.");
			const levelInfo = this.calcLevel(globalXp);
			if (!levelInfo) throw new Error("Unable to calculate level.");
			const rankInfo = this.getGlobalRank(userId);
			if (!rankInfo) throw new Error("Unable to get rank.");
			return { globalXp, ...levelInfo, rank: rankInfo.rank };
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get the global XP leaderboard.
	 * @param {Number} startPosition Start position/offset of the page.
	 * @param {Number} items Items per page.
	 * @returns {Object} Leaderboard page.
	 */
	getGlobalXpLeaderboard(startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getGlobalXpLeaderboard");
			const leaderboard = this.db.prepare(`select cast(UserId as text) as 'userId', TotalXp as 'globalXp' from DiscordUser order by TotalXp desc limit ${items} offset ${startPosition}`).all();
			if (!leaderboard.length) throw new Error("Unable to fetch global XP leaderboard.");
			return leaderboard.map((user, rank) => ({
				...user,
				...this.calcLevel(user.globalXp),
				rank: startPosition + rank + 1
			}));
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get club leaderboard.
	 * @param {Number} startPosition Start position/offset of the page.
	 * @param {Number} items Items per page.
	 * @returns {Object} Leaderboard page.
	 */
	getClubLeaderboard(startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getClubLeaderboard");
			const clubs = this.db.prepare(`select (a.Name || "#" || a.Discrim) as name, cast(b.UserId as text) as owner, a.Xp as xp, a.ImageUrl as icon, a.MinimumLevelReq as levelRequirement, a.Description as description from Clubs a, DiscordUser b WHERE a.OwnerId = b.Id order by a.Xp desc limit ${items} offset ${startPosition}`).all();
			if (!clubs.length) throw new Error("Unable to fetch clubs.");
			return clubs.map((club, rank) => ({
				...this.calcLevel(club.xp),
				...club, rank: rank + 1
			}));
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get club information by name.
	 * @param {Number} name Name of the club.
	 * @returns {Object} Information about the club.
	 */
	getClubInfo(name) {
		try {
			this.checkEndpoint("getClubInfo");
			const club = this.db.prepare(`select(a.Name || "#" || a.Discrim) as clubName, cast(b.UserId as text) as owner, a.Xp as xp, a.ImageUrl as icon, a.MinimumLevelReq as levelRequirement, a.Description as description from Clubs a, DiscordUser b WHERE a.OwnerId = b.Id AND clubName = "${name}"`).get();
			if (!club) throw new Error("No clubs exist with the specified name.");
			const levelInfo = this.calcLevel(club.xp);
			if (!levelInfo) throw new Error("Unable to calculate level info.");
			const rankings = this.db.prepare("select (Name || \"#\" || Discrim) as name from Clubs order by Xp desc").all().map(club => club.name);
			if (!rankings.length) throw new Error("Unable to get club ranking.");
			const rank = rankings.indexOf(name) < 0 ? rankings.length : rankings.indexOf(name) + 1;
			return {
				name: club.clubName,
				owner: club.owner,
				description: club.description,
				icon: club.icon,
				xp: club.xp,
				levelRequirement: club.levelRequirement,
				...levelInfo, rank
			};
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get club information by club member.
	 * @param {Number} userId ID of the club member.
	 * @returns {Object} Information about the club.
	 */
	getClubInfoByUser(userId) {
		try {
			this.checkEndpoint("getClubInfoByUser");
			this.checkIfUserExists(userId);
			const club = this.db.prepare(`select(a.Name || "#" || a.Discrim) as clubName from Clubs a, DiscordUser b WHERE b.ClubId = a.Id AND b.UserId = ${userId}`).get();
			if (!club) throw new Error("Club not found.");
			return this.getClubInfo(club.clubName);
		}
		catch (error) {
			return { error };
		}
	}

	/**
	 * Get club members by name.
	 * @param {Number} name Name of the club.
	 * @param {Number} startPosition Start position/offset of the page.
	 * @param {Number} items Items per page.
	 * @returns {Object} Members page.
	 */
	getClubMembers(name, startPosition = 0, items = 10) {
		try {
			this.checkEndpoint("getClubMembers");
			const members = this.db.prepare(`select cast(a.UserId as text) as userId, a.TotalXp as xp, a.IsClubAdmin as admin from DiscordUser a, Clubs b where a.ClubId = b.Id AND (b.Name || "#" || b.Discrim)="${name}" order by xp desc limit ${items} offset ${startPosition}`).all();
			if (!members.length) throw new Error("No members found for this club.");
			return members.map((member, rank) => {
				const levelInfo = this.calcLevel(member.xp);
				return {
					userId: member.userId,
					admin: member.admin > 0,
					xp: member.xp,
					level: levelInfo.level,
					levelXp: levelInfo.levelXp,
					rank: rank + 1
				};
			});
		}
		catch (error) {
			return { error };
		}
	}
}

module.exports = Connector;