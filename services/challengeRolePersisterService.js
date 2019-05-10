const { Role } = require("discord.js");

module.exports = class ChallengeRolePersisterService extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Challenge Role Persister Service",
			description: "Checks every fifteen minutes for adding/removing persistent challenge roles.",
			enabled: true
		});
	}

	async everyFifteenMinutes(ctx) {
		for (const [id, guild] of ctx.client.guilds) {
			const guildDb = ctx.getDb(id);

			const challengeData = await guildDb.get("challengeData") || await guildDb.set("challengeData", {});
			if (!challengeData.users) return;

			const challengeRoles = await guildDb.get("challengeRoles") || await guildDb.set("challengeRoles", {});
			if (!challengeRoles.enabled || !challengeRoles.persistent) return;
			if (!challengeRoles.roles || !Object.entries(challengeRoles.roles).length) return;

			const botMember = guild.members.get(ctx.client.user.id);
			if (!botMember.hasPermission("MANAGE_ROLES")) return;

			const highestBotRole = botMember.roles.sort(Role.comparePositions).last();

			const members = [];
			for (const [id, challenges] of Object.entries(challengeData.users))
				if (guild.members.has(id) && challenges.length > 0)
					members.push([guild.members.get(id), challenges.length]);

			if (!members.length) return;

			for (const [member, amountOfChallengesCompleted] of members) {

				const configuredChallengeRoles = Object.entries(challengeRoles.roles)
					.map(([key, value]) => [parseInt(key), value])
					.sort(([a], [b]) => a - b);

				let roleChanges = [];

				for (const [amount, role] of configuredChallengeRoles) {
					if (!guild.roles.has(role)) {
						delete challengeRoles.roles[amount];
						continue;
					}

					if (guild.roles.get(role).comparePositionTo(highestBotRole) >= 0)
						return;

					if (amountOfChallengesCompleted >= amount) {
						if (!challengeRoles.stacked)
							roleChanges.forEach(e => e.action = "-");
						roleChanges.push({ amount, role, action: "+" });
					}
				}

				roleChanges = roleChanges.filter(entry => {
					if (entry.action === "+" && member.roles.has(entry.role)) return false;
					else if (entry.action === "-" && !member.roles.has(entry.role)) return false;
					else return true;
				});

				try {
					if (roleChanges.length > 0) {
						const rolesToAdd = roleChanges.filter(entry => entry.action === "+").map(entry => guild.roles.get(entry.role));
						await member.addRoles(rolesToAdd, "Adding challenge roles.");

						const rolesToRemove = roleChanges.filter(entry => entry.action === "-").map(entry => guild.roles.get(entry.role));
						await member.removeRoles(rolesToRemove, "Removing challenge roles.");
					}
				}
				catch (err) { console.log(err); }

				await guildDb.set("challengeRoles", challengeRoles);
			}
		}
	}
};
