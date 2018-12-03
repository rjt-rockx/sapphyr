const { RichEmbed } = require("discord.js"), { purple } = require("../../utils/colors.js");

module.exports = class BugReportCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "bug",
			memberName: "bug",
			group: "utils",
			description: "Report a bug to the developers of Sapphyr.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "context",
					prompt: "Describe the issue with Sapphyr, and how we can re-create it.",
					type: "string"
				}
			]
		});
	}
	async task(ctx) {
		let url = "https://cdn.discordapp.com/attachments/448913068680806410/513400134223265802/unknown.png";
		if (ctx.message.attachments.size >= 1) url = ctx.message.attachments.first().url;
		const embed = new RichEmbed()
			.setColor(purple)
			.setAuthor(`${ctx.message.author.tag} | ${ctx.message.author.id}`)
			.addField("Description:", ctx.args.context)
			.addField("Visual:", `URL: [Here](${url}) | Image:`)
			.setImage(url);
		await this.client.channels.get("477644168299151375").send({ embed });
		ctx.embed({ description: "Success! Thank you." });
	}
};
