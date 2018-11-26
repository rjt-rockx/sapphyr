var { RichEmbed } = require("discord.js");

module.exports = class SetRoleCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "setrole",
			memberName: "setrole",
			group: "nadekoconnector",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			description: "Add a role to the shop.",
			args: [{
				key: "role",
				prompt: "What role do you want to add to the shop?",
				type: "string"
			}]
		});
	}
	async task(ctx) {
		let roles = await ctx.db.get("roles");
		const role = ctx.message.guild.roles.find(rolee => rolee.name === ctx.args.role).name;
		roles.push(role);
		roles = ctx.db.set("roles", roles);
		const successEmbed = new RichEmbed()
			.setTitle("Success")
			.setDescription(`Successfully added role \`${role}\` to the shop.`);
		return ctx.send(successEmbed);
	}
};
