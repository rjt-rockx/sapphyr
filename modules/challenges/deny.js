const { RichEmbed, Attachment } = require("discord.js");
const DiscordColors = global.utils.colors.numbers.discord;
const properRoundToTwo = num => +(Math.round(num + "e+2") + "e-2");

module.exports = class DenyCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "deny",
			memberName: "deny",
			aliases: ["denychallenge", "dch"],
			group: "challenges",
			description: "Deny a challenge.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "reason",
					prompt: "Reason why the submission was denied.",
					type: "string",
					default: "No reason specified."
				},
				{
					key: "messages",
					prompt: "The IDs of the submission message(s) to deny.",
					validate: async (val, msg) => {
						for (const value of val.split(" ")) {
							if (!/^[0-9]+$/.test(value)) return false;
							const message = await msg.channel.fetchMessage(value).catch(() => null);
							if (!message) return false;
						}
						return true;
					},
					parse: async (val, msg) => Promise.all(val.split(" ").map(id => msg.channel.fetchMessage(id)))
				}
			]
		});
	}

	async task(ctx) {
		if (this.isCached(ctx.args.messages, ctx.guild.id))
			return ctx.selfDestruct("These messages were already denied by someone else!");
		this.cache(ctx.args.messages, ctx.guild.id);

		const { approverRole, approverChannel, challengeData, storageChannel } = await ctx.db.get();
		if (!approverRole) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		}
		if (!approverChannel) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send(`Approver channel not specified. Please specify an approver channel using ${ctx.prefix}approverChannel`);
		}

		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("Approver role not found.");
		}
		if (!ctx.guild.channels.has(approverChannel)) {
			await ctx.db.set("approverChannel", "");
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("Approver channel not found.");
		}

		if (ctx.channel.id !== approverChannel) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send(`This command can only be used in #${ctx.guild.channels.get(approverChannel).name}`);
		}
		if (!ctx.member.roles.has(approverRole)) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send(`You need the ${ctx.guild.roles.get(approverRole).name} role to use this command.`);
		}

		const authorId = ctx.args.messages[0].author.id;
		if (authorId && (authorId === ctx.user.id)) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("You cannot deny your own messages!");
		}

		for (const submissionMessage of ctx.args.messages) {
			if (submissionMessage.author.id !== authorId) {
				this.uncache(ctx.args.messages, ctx.guild.id);
				return ctx.send("Messages from multiple users are not allowed.");
			}
			if (submissionMessage.author.bot) {
				this.uncache(ctx.args.messages, ctx.guild.id);
				return ctx.send("Bot messages can't be denied.");
			}
		}

		const attachmentLinks = [], attachmentField = [];
		if (storageChannel && ctx.guild.channels.has(storageChannel)) {

			for (const submissionMessage of ctx.args.messages) {
				let currentAttachments = [...submissionMessage.attachments.values()];
				if (currentAttachments.some(attachment => !attachment.filesize || attachment.filesize >= 1024 * 1024 * 8)) {
					this.uncache(ctx.args.messages, ctx.guild.Id);
					return ctx.send("Attachments are too big to parse.");
				}
				currentAttachments = currentAttachments.filter(attachment => typeof attachment.filesize === "number" && attachment.filesize < 1024 * 1024 * 8).map(file => new Attachment(file.url));

				if (currentAttachments.length > 0) {
					const attachmentMessage = await ctx.guild.channels.get(storageChannel).send({
						embed: new RichEmbed({
							author: {
								icon_url: submissionMessage.author.displayAvatarURL,
								name: `Attachments sent by ${submissionMessage.author.tag}.`
							},
							title: "Message Content",
							description: submissionMessage.cleanContent,
							footer: { text: `User ID: ${submissionMessage.author.id} | Message ID: ${submissionMessage.id}` },
							timestamp: submissionMessage.createdTimestamp
						}),
						files: currentAttachments
					});
					const currentAttachmentLinks = [...attachmentMessage.attachments.values()]
						.map(({ filename, filesize, url }) => ({
							name: filename, size: filesize, url
						}));
					attachmentLinks.push(...currentAttachmentLinks);
				}
			}

			if (attachmentLinks.length > 0)
				attachmentField.push({
					name: "Attachments",
					value: attachmentLinks.map(({ name, size, url }) => `[${name} (${properRoundToTwo(size / (1024 * 1024))} MB)](${url})`).join("\n")
				});

		}

		const fullMessage = ctx.args.messages.map(message => message.cleanContent).join("\n") || "No message content.";
		if (fullMessage.length > 2000) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("Combined message length must be less than or equal to 2000 characters.");
		}

		const timestamp = Date.now();
		const logChannel = challengeData.logChannel ? ctx.guild.channels.get(challengeData.logChannel) : null;
		if (logChannel) {
			await logChannel.send({
				embed: new RichEmbed({
					author: { name: `${ctx.args.messages[0].author.tag}'s submission was denied.` },
					title: "Message Content",
					description: fullMessage,
					thumbnail: { url: ctx.args.messages[0].author.displayAvatarURL },
					fields: [
						{
							name: `Denied by ${ctx.user.tag} (${ctx.user.id}).`,
							value: `${ctx.args.messages[0].author.tag} was not rewarded with anything.`
						},
						{
							name: "Reason",
							value: ctx.args.reason
						},
						...attachmentField
					],
					color: DiscordColors.green,
					footer: { text: `User ID: ${ctx.args.messages[0].author.id}` },
					timestamp
				})
			});
		}

		await ctx.db.set("challengeData", challengeData);
		try {
			await ctx.args.messages[0].author.send({
				embed: new RichEmbed({
					author: { name: "Your submission was approved!" },
					title: "Message Content",
					description: fullMessage,
					thumbnail: { url: ctx.args.messages[0].author.displayAvatarURL },
					fields: [
						{
							name: `Denied by ${ctx.user.tag} (${ctx.user.id}).`,
							value: "You were not rewarded anything."
						},
						{
							name: "Reason",
							value: ctx.args.reason
						},
						...attachmentField
					],
					color: DiscordColors.green,
					footer: { text: `User ID: ${ctx.args.messages[0].author.id}` },
					timestamp
				})
			});
		}
		catch (error) {
			ctx.selfDestruct("Unable to DM user, ignoring.");
		}
		await ctx.message.delete();
		await Promise.all(ctx.args.messages.map(message => message.delete()));
		this.uncache(ctx.args.messages, ctx.guild.id);
		return ctx.selfDestruct("Challenge submission successfully denied.");
	}

	uncache(messages, guildId) {
		this.checkOrInitializeCache(guildId);
		if (!(messages instanceof Array))
			messages = [messages];
		messages.map(message => {
			if (typeof message === "string" && /^[0-9]+$/.test(message)) return message;
			else if (typeof message.id === "string" && /^[0-9]+$/.test(message.id)) return message.id;
		}).forEach(id => global.challengeMessages[guildId].delete(id));
	}

	cache(messages, guildId) {
		this.checkOrInitializeCache(guildId);
		if (!(messages instanceof Array))
			messages = [messages];
		messages.map(message => {
			if (typeof message === "string" && /^[0-9]+$/.test(message)) return message;
			else if (typeof message.id === "string" && /^[0-9]+$/.test(message.id)) return message.id;
		}).forEach(id => global.challengeMessages[guildId].add(id));
	}

	isCached(messages, guildId) {
		this.checkOrInitializeCache(guildId);
		if (!(messages instanceof Array))
			messages = [messages];
		return messages.map(message => {
			if (typeof message === "string" && /^[0-9]+$/.test(message)) return message;
			else if (typeof message.id === "string" && /^[0-9]+$/.test(message.id)) return message.id;
		}).every(id => global.challengeMessages[guildId].has(id));
	}

	checkOrInitializeCache(guildId) {
		if (!global.challengeMessages) global.challengeMessages = {};
		if (!global.challengeMessages[guildId]) global.challengeMessages[guildId] = new Set();
	}
};
