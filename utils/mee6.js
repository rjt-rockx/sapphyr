var got = require("got");

class Mee6Api {
    constructor(guildId, cacheInterval) {
        if (!guildId || typeof guildId !== "string")
            throw new Error("Invalid guild ID specified.");
        if (!cacheInterval) cacheInterval = 60;
        this.guildId = guildId;
        let context = this;
        setInterval(() => { context.cacheLeaderboard(context) }, cacheInterval * 1000);
    }

    async cacheLeaderboard(context) {
        if (!context)
            context = this;
        let pageNumber = 0, items = 1000;
        let leaderboard = [];
        while (true) {
            let page = await context.getLeaderboard(items, pageNumber);
            leaderboard = leaderboard.concat(page);
            if (page.length < items)
                break;
            ++pageNumber;
        }
        this.cachedLeaderboard = leaderboard;
    }

    async getRoleRewards() {
        let { body: { role_rewards } } = await got.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${this.guildId}?limit=0`, { json: true });
        return role_rewards.sort((a, b) => a.rank - b.rank);
    }

    async getLeaderboard(items, page) {
        let { body: { players: members } } = await got.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${this.guildId}?limit=${items}&page=${page}`, { json: true });
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
            }
        });
    }

    async getUserXp(userId) {
        if (typeof userId !== "string")
            throw new Error("User ID must be a string.");
        if (!this.cachedLeaderboard)
            await this.cacheLeaderboard();
        let userXp = this.cachedLeaderboard.filter(user => user.id === userId);
        if (!userXp)
            throw new Error("User not found.");
        return userXp[0];
    }
}

module.exports = Mee6Api;
