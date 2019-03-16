module.exports = class BirthdayRole extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Birthday Role Service",
			description: "Stores when a birthday role was added to a member and removes it after 24h.",
			enabled: true
		});
	}

	async onGuildMemberUpdate(ctx) {
		const birthdayRole = await ctx.db.get("birthdayRole") || await ctx.db.set("birthdayRole", "");
		if (birthdayRole && ctx.guild.roles.has(birthdayRole)) {
			if (!ctx.oldMember.roles.has(birthdayRole) && ctx.newMember.roles.has(birthdayRole)) {
				const pendingRemovals = await ctx.globalDb.get("pendingRemovals") || await ctx.globalDb.set("pendingRemovals", []);
				pendingRemovals.push({
					guild: ctx.guild.id,
					member: ctx.user.id,
					role: birthdayRole,
					time: Date.now() + (24 * 60 * 60 * 1000)
				});
				await ctx.globalDb.set("pendingRemovals", pendingRemovals);
			}
		}
	}

	async everyFiveMinutes(ctx) {
		let pendingRemovals = await ctx.globalDb.get("pendingRemovals") || await ctx.globalDb.set("pendingRemovals", []);
		if (pendingRemovals.length) {
			pendingRemovals = await Promise.all(pendingRemovals.map(async removal => {
				if (removal.time > Date.now())
					return removal;
				const guild = ctx.client.guilds.get(removal.guild);
				if (!guild || !guild.roles.has(removal.role)) return;
				const member = guild.members.get(removal.member);
				if (!member || !member.roles.has(removal.role)) return;
				if (member.roles.has(removal.role)) {
					await member.removeRole(removal.role, "Birthday role duration over.");
					return;
				}
			}));
			pendingRemovals = pendingRemovals.filter(x => !!x);
			await ctx.globalDb.set("pendingRemovals", pendingRemovals);
		}
	}
};
