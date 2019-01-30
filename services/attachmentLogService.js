const { Attachment, RichEmbed } = require("discord.js");
const properRoundToTwo = num => +(Math.round(num + "e+2") + "e-2");

module.exports = class AttachmentLog extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Attachment Logging Service",
			description: "Fetches and reuploads attachments sent in the server to a particular channel.",
			enabled: true
		});
	}

	async onMessage(ctx) {
		if (!ctx.guild) return;
		const logChannel = await ctx.db.get("attachmentLogChannel");
		if (ctx.guild && ctx.guild.channels.has(logChannel) && ctx.message.attachments.size > 0 && !ctx.user.bot) {
			const attachments = [...ctx.message.attachments.values()];
			const reuploadable = attachments.filter(attachment => typeof attachment.filesize === "number" && attachment.filesize <= 1024 * 1024 * 8).map(file => new Attachment(file.url));
			const attachmentLinks = attachments.map(attachment => `[${attachment.filename} (${properRoundToTwo(attachment.filesize / (1024 * 1024))} MB)](${attachment.url})`).join("\n");
			await ctx.guild.channels.get(logChannel).send({
				embed: new RichEmbed({
					author: {
						name: `${attachments.length} attachment${attachments.length > 1 ? "s" : ""} sent by ${ctx.user.tag}.`
					},
					thumbnail: {
						url: ctx.user.displayAvatarURL
					},
					title: `Message sent in #${ctx.channel.name}`,
					description: ctx.message.cleanContent || "No message content.",
					fields: [{
						name: "Original Attachment Links",
						value: attachmentLinks || "No attachment links could be parsed."
					}],
					footer: { text: `User ID: ${ctx.user.id} | Message ID: ${ctx.message.id}` },
					timestamp: ctx.message.createdTimestamp
				}),
				files: reuploadable
			});
		}
	}
};
