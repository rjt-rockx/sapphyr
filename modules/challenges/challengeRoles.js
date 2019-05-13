const { Role } = require("discord.js");

module.exports = class ChallengeRoles extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "challengeroles",
			description: "Enable/disable challenge roles, or get/set/remove a challenge role. Each challenge role will be given out once a specific number of challenges is approved for a user. \nEnabling/disabling/settings/removing challenge roles requires Administrator permissions.",
			group: "challenges",
			memberName: "challengeroles",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Enable/disable challenge roles, or get/set/remove a challenge role for this guild.",
					type: "string",
					oneOf: ["set", "get", "remove", "enable", "disable"]
				},
				{
					key: "amount",
					prompt: "Amount of challenges to complete to get this role.",
					type: "integer",
					default: ""
				},
				{
					key: "role",
					prompt: "Role to allow challenge approvals for.",
					type: "role",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		const challengeRoles = await ctx.db.get("challengeRoles") || await ctx.db.set("challengeRoles", {});

		if (["set", "remove", "enable", "disable"].includes(ctx.args.action))
			if (!ctx.member.hasPermission("ADMINISTRATOR"))
				return ctx.send("You need the Administrator permission to perform this action.");

		if (!challengeRoles.roles || typeof challengeRoles.roles !== "object")
			challengeRoles.roles = {};
		for (const [amount, role] of Object.entries(challengeRoles.roles)) {
			if (!ctx.guild.roles.has(role))
				delete challengeRoles.roles[amount];
		}
		await ctx.db.set("challengeRoles", challengeRoles);

		if (ctx.args.action === "set") {
			if (ctx.args.amount < 1)
				return ctx.send("Invalid amount of challenges specified.");
			if (!(ctx.args.role instanceof Role))
				return ctx.send("Invalid role specified.");
			challengeRoles.roles[ctx.args.amount] = ctx.args.role.id;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send(`Challenge role for ${ctx.args.amount} challenges successfully set to the ${ctx.args.role.name} role.`);
		}

		else if (ctx.args.action === "get") {
			if (Object.keys(challengeRoles.roles).length < 1)
				return ctx.send("No challenge roles set for this guild.");
			if (typeof ctx.args.amount === "string" && !ctx.args.amount) {
				const roleFields = Object.entries(challengeRoles.roles).map(([amount, role]) => ({
					name: ctx.guild.roles.get(role).name,
					value: [
						`Obtained on completing ${amount} challenges.`,
						`${ctx.guild.roles.get(role).members.size} members have this role.`,
						"\u200b"
					].join("\n")
				}));
				return new global.utils.fieldPaginator(ctx.channel, ctx.user, roleFields, 15, {
					embedTemplate: {
						title: `Challenge roles in ${ctx.guild.name}`,
						thumbnail: { url: ctx.guild.iconURL }
					}
				});
			}
			if (ctx.args.amount > 0) {
				const role = challengeRoles.roles[ctx.args.amount];
				if (!role)
					return ctx.send("No role set for the specified amount of challenges.");
				return ctx.embed({
					fields: [{
						name: ctx.guild.roles.get(role).name,
						value: [
							`Obtained on completing ${ctx.args.amount} challenges.`,
							`${ctx.guild.roles.get(role).members.size} members have this role.`,
							"\u200b"
						].join("\n")
					}]
				});
			}
		}

		else if (ctx.args.action === "remove") {
			if (ctx.args.amount < 1)
				return ctx.send("Invalid amount of challenges specified.");
			if (!challengeRoles.roles[ctx.args.amount])
				return ctx.send("No challenge role set for the specified amount of challenges.");
			delete challengeRoles.roles[ctx.args.amount];
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send(`Challenge role for ${ctx.args.amount} challenges successfully removed.`);
		}

		else if (ctx.args.action === "enable") {
			challengeRoles.enabled = true;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send("Challenge roles successfully enabled.");
		}

		else if (ctx.args.action === "disable") {
			challengeRoles.enabled = false;
			await ctx.db.set("challengeRoles", challengeRoles);
			return ctx.send("Challenge roles successfully disabled.");
		}
	}
};
