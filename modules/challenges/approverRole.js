const { Role } = require("discord.js");

module.exports = class ApproverRoleCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "approverrole",
			description: "Set or remove an approver role. Challenges for this guild can only be approved by people with this role.",
			group: "challenges",
			memberName: "approverrole",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "action",
					prompt: "Set, get or remove the approver role for this guild.",
					type: "string",
					oneOf: ["set", "get", "remove"]
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
		const approverRole = await ctx.db.get("approverRole") || await ctx.db.set("approverRole", "");
		if (ctx.args.action === "set") {
			if (!(ctx.args.role instanceof Role))
				return ctx.send("Invalid role specified.");
			await ctx.db.set("approverRole", ctx.args.role.id);
			return ctx.send(`Approver role successfully set to the ${ctx.args.role.name} role.`);
		}
		else if (ctx.args.action === "get") {
			if (!approverRole)
				return ctx.send("No approver role set.");
			if (!ctx.guild.roles.has(approverRole)) {
				await ctx.db.set("approverRole", "");
				return ctx.send("Approver role not found.");
			}
			return ctx.send(`Approver role is currently set to the ${ctx.guild.roles.get(approverRole).name} role.`);
		}
		else if (ctx.args.action === "remove") {
			await ctx.db.set("approverRole", "");
			return ctx.send("Approver role successfully removed.");
		}
	}
};
