var got = require("got");

class Mee6Api {
    constructor(guilds = [], cacheInterval = 60) {
        this._guilds = Array.isArray(guilds) ? guilds : [];
        this._cacheInterval = cacheInterval;
    }

    async startCaching() {
        setInterval(() => this.cacheLeaderboard(), this._cacheInterval * 1000);
    }

    addGuild(guildId) {
        if (this._guilds.findIndex(guild => guild.id === guildId) < 0)
            this._guilds.push({ id: guildId });
    }

    removeGuild(guildId) {
        let index = this._guilds.findIndex(guild => guild.id === guildId);
        if (index >= 0)
            this._guilds.splice(index, 1);
    }

    listGuilds() {
        return [...new Set(this._guilds)];
    }

    get guilds() {
        return this._guilds;
    }

    async cacheGuilds() {
        if (!this._guilds) return;
        this._guilds = await Promise.all(this._guilds.map(async guild => {
            let pageNumber = 0, items = 1000, leaderboard = [];
            while (true) {
                let page = await this.getLeaderboard(guild.id, items, pageNumber);
                if (!Array.isArray(page))
                    return;
                leaderboard = leaderboard.concat(page);
                if (page.length < items)
                    break;
                ++pageNumber;
            }
            guild.leaderboard = leaderboard;
            guild.roleRewards = await this.getRoleRewards(guild.id);
            return guild;
        }));
    }

    async getRoleRewards(guildId) {
        let { body: { role_rewards } } = await got.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?limit=0`, { json: true });
        return role_rewards.sort((a, b) => a.rank - b.rank);
    }

    async getLeaderboard(guildId, items, page) {
        if (items > 1000)
            throw new Error("Items can't be greater than 1000 due to API restrictions.");
        let { body: { players: members } } = await got.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?limit=${items}&page=${page}`, { json: true });
        return members.map((user, index) => {
            return {
                id: user.id,
                tag: user.username + "#" + user.discriminator,
                level: user.level,
                xp: {
                    inLevel: user.detailed_xp[0],
                    neededToLevelUp: user.detailed_xp[1] - user.detailed_xp[0],
                    ofLevel: user.detailed_xp[1],
                    total: user.detailed_xp[2]
                },
                rank: (items * page) + index + 1
            };
        });
    }

    async getUserXp(userId, guildId) {
        if (typeof userId !== "string")
            throw new Error("User ID must be a string.");
        if (typeof guildId !== "string")
            throw new Error("Guild ID must be a string.");
        if (!this.cachedLeaderboard)
            await this.cacheLeaderboard();
        let userXp = this.cachedLeaderboard.filter(user => user.id === userId);
        if (!userXp)
            throw new Error("User not found.");
        return userXp[0];
    }
}

module.exports = Mee6Api;
