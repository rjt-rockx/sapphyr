const got = require("got");

class Mee6Api {
	constructor(guilds = [], cacheInterval = 60) {
		this._guilds = Array.isArray(guilds) ? guilds : [];
		this._cacheInterval = cacheInterval;
	}

	startCaching() {
		setInterval(() => this.cacheGuilds(), this._cacheInterval * 1000);
	}

	checkType([name, data, type]) {
		if (typeof data !== type) throw new Error(`${name} must be a ${type}`);
	}

	addGuild(guildId) {
		this.checkType(["Guild ID", guildId, "string"]);
		if (this._guilds.findIndex(guild => guild.id === guildId) < 0) this._guilds.push({ id: guildId });
	}

	removeGuild(guildId) {
		this.checkType(["Guild ID", guildId, "string"]);
		let index = this._guilds.findIndex(guild => guild.id === guildId);
		if (index >= 0) this._guilds.splice(index, 1);
	}

	checkIfExists(guildId) {
		this.checkType(["Guild ID", guildId, "string"]);
		return !(this._guilds.findIndex(guild => guild.id === guildId) < 0);
	}

	listGuilds() {
		this._guilds = [...new Set(this._guilds)];
		return this._guilds;
	}

	async cacheGuilds() {
		if (!this._guilds || (Array.isArray(this._guilds) && this._guilds.length < 1)) return null;
		for (let guild of this._guilds) {
			let pageNumber = 0, items = 999, leaderboard = [];
			while (true) {
				let page = await this.getLeaderboardPage(guild.id, items, pageNumber);
				if (!Array.isArray(page)) return null;
				leaderboard = leaderboard.concat(page);
				if (page.length < items) break;
				++pageNumber;
			}
			guild.leaderboard = leaderboard;
			guild.roleRewards = await this.getRoleRewards(guild.id);
		}
		return this._guilds;
	}

	async getLeaderboardPage(guildId, items = 999, page = 0) {
		this.checkType(["Guild ID", guildId, "string"]);
		if (items > 999) throw new Error("Items can't be greater than 999 due to API restrictions.");
		let { body: { players: members } } = await got.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?limit=${items}&page=${page}`, { json: true });
		if (!members) return null;
		return members.map((user, index) => ({
			id: user.id,
			tag: `${user.username}#${user.discriminator}`,
			level: user.level,
			xp: {
				inLevel: user.detailed_xp[0],
				neededToLevelUp: user.detailed_xp[1] - user.detailed_xp[0],
				ofLevel: user.detailed_xp[1],
				total: user.detailed_xp[2],
			},
			rank: (items * page) + index + 1,
		}));
	}

	async getRoleRewards(guildId) {
		this.checkType(["Guild ID", guildId, "string"]);
		let { body: { roleRewards } } = await got.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?limit=1&page=0`, { json: true });
		if (!roleRewards) return null;
		return roleRewards.sort((a, b) => a.rank - b.rank);
	}

	async getUserXp(guildId, userId) {
		this.checkType(["User ID", userId, "string"]);
		this.checkType(["Guild ID", guildId, "string"]);
		if (!this.checkIfExists(guildId)) return null;
		let cachedLeaderboard = await this.getLeaderboardPage(guildId);
		let userXp = cachedLeaderboard.filter(user => user.id === userId);
		if (!userXp || (Array.isArray(userXp) && userXp.length < 1)) return null;
		return userXp[0];
	}

	async getCachedLeaderboard(guildId) {
		if (!this.checkIfExists(guildId)) return null;
		let guild = this._guilds.filter(guildd => guildd.id === guildId)[0];
		if (!guild.leaderboard) await this.cacheGuilds();
		return guild.leaderboard;
	}

	async getCachedRoleRewards(guildId) {
		if (!this.checkIfExists(guildId)) return null;
		let guild = this._guilds.filter(guildd => guildd.id === guildId)[0];
		if (!guild.roleRewards) await this.cacheGuilds();
		return guild.roleRewards;
	}

	getCachedUserXp(guildId, userId) {
		return this.getUserXp(guildId, userId);
	}
}

module.exports = Mee6Api;
