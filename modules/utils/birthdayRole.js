const { Role } = require("discord.js");

module.exports = class BirthdayRole extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "birthdayrole",
			description: "Get, set or remove a birthday role for this guild. \nBirthday roles will automatically be removed in 24h after they have been assigned to someone.",
			group: "utils",
			memberName: "birthdayrole",
			guildOnly: true,
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Get, set or remove the birthday role for this guild.",
					type: "string",
					oneOf: ["set", "get", "remove"]
				},
				{
					key: "role",
					prompt: "Birthday role for this guild.",
					type: "role",
					default: "none"
				}
			]
		});
	}

	async task(ctx) {
		const birthdayRole = await ctx.db.get("birthdayRole") || await ctx.db.set("birthdayRole", "");
		if (ctx.args.action === "set") {
			if (!(ctx.args.role instanceof Role))
				return ctx.send("Invalid role specified.");
			await ctx.db.set("birthdayRole", ctx.args.role.id);
			return ctx.send(`Birthday role successfully set to the ${ctx.args.role.name} role.`);
		}
		else if (ctx.args.action === "get") {
			if (!birthdayRole)
				return ctx.send("No birthday role set.");
			if (!ctx.guild.roles.has(birthdayRole)) {
				await ctx.db.set("birthdayRole", "");
				return ctx.send("Birthday role not found.");
			}
			return ctx.send(`Birthday role is currently set to the ${ctx.guild.roles.get(birthdayRole).name} role.`);
		}
		else if (ctx.args.action === "remove") {
			await ctx.db.set("birthdayRole", "");
			return ctx.send("Birthday role successfully removed.");
		}
	}
};
