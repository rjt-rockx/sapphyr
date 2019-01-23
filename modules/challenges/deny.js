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
					key: "messageId",
					prompt: "ID of the message to grab.",
					type: "string"
				},
				{
					key: "reason",
					prompt: "Reason why the submission was denied.",
					type: "string",
					default: "No reason specified."
				}
			]
		});
	}
	async task(ctx) {
		if (this.isCached(ctx.args.messageId, ctx.guild.id))
			return ctx.selfDestruct("This message was already denied by someone else!");
		this.cache(ctx.args.messageId, ctx.guild.id);
		const { approverRole, approverChannel, challengeData, storageChannel } = await ctx.db.get();
		if (!approverRole) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		}
		if (!approverChannel) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send(`Approver channel not specified. Please specify an approver channel using ${ctx.prefix}approverChannel`);
		}
		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Approver role not found.");
		}
		if (!ctx.guild.channels.has(approverChannel)) {
			await ctx.db.set("approverChannel", "");
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Approver channel not found.");
		}
		if (ctx.channel.id !== approverChannel) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send(`This command can only be used in #${ctx.guild.channels.get(approverChannel).name}`);
		}
		if (!ctx.member.roles.has(approverRole)) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send(`You need the ${ctx.guild.roles.get(approverRole).name} to use this command.`);
		}
		let submission;
		try {
			submission = await ctx.channel.fetchMessage(ctx.args.messageId);
		}
		catch (error) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Unable to fetch the message. Make sure the message exists in this channel.");
		}
		if (submission.author.id === ctx.user.id) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("You cannot deny your own messages!");
		}

		let attachments = [];
		if (storageChannel && ctx.guild.channels.has(storageChannel)) {
			attachments = [...submission.attachments.values()];
			if (attachments.some(attachment => !attachment.filesize || attachment.filesize >= 1024 * 1024 * 8)) {
				this.uncache(ctx.args.messageId, ctx.guild.Id);
				return ctx.send("Attachments are too big to parse.");
			}
			attachments = attachments.filter(attachment => typeof attachment.filesize === "number" && attachment.filesize < 1024 * 1024 * 8).map(file => new Attachment(file.url));
			if (attachments.length > 0) {
				const attachmentMessage = await ctx.guild.channels.get(storageChannel).send({
					embed: new RichEmbed({
						author: {
							icon_url: submission.author.displayAvatarURL,
							name: `Attachments sent by ${submission.author.tag}.`
						},
						title: "Message Content",
						description: submission.cleanContent,
						footer: { text: `User ID: ${submission.author.id} | Message ID: ${submission.id}` },
						timestamp: submission.createdTimestamp
					}),
					files: attachments
				});
				attachments = [{
					name: "Attachments",
					value: [...attachmentMessage.attachments.values()].map(attachment => `[${attachment.filename} (${properRoundToTwo(attachment.filesize / (1024 * 1024))} MB)](${attachment.url})`).join("\n")
				}];
			}
		}

		const timestamp = Date.now();
		const logChannel = challengeData.logChannel ? ctx.guild.channels.get(challengeData.logChannel) : null;
		if (logChannel)
			await logChannel.send({
				embed: new RichEmbed({
					author: { name: `${submission.author.tag}'s submission was denied.` },
					title: "Message Content",
					description: submission.cleanContent,
					thumbnail: { url: submission.author.displayAvatarURL },
					fields: [
						{
							name: `Denied by ${ctx.user.tag} (${ctx.user.id}).`,
							value: `${submission.author.tag} was not rewarded anything.`
						},
						{
							name: "Reason",
							value: ctx.args.reason
						},
						...attachments
					],
					color: DiscordColors.red,
					footer: { text: `User ID: ${submission.author.id}` },
					timestamp
				})
			});

		await submission.author.send({
			embed: new RichEmbed({
				author: { name: "Your submission was denied!" },
				title: "Message Content",
				description: submission.cleanContent,
				thumbnail: { url: submission.author.displayAvatarURL },
				fields: [
					{
						name: `Denied by ${ctx.user.tag} (${ctx.user.id}).`,
						value: "You were not rewarded anything."
					},
					{
						name: "Reason",
						value: ctx.args.reason
					},
					...attachments
				],
				color: DiscordColors.red,
				footer: { text: `User ID: ${submission.author.id}` },
				timestamp
			})
		});
		await ctx.message.delete();
		await submission.delete();
		this.uncache(ctx.args.messageId, ctx.guild.id);
		return ctx.selfDestruct("Challenge submission successfully denied.");
	}

	uncache(messageId, guildId) {
		this.checkOrInitializeCache(guildId);
		global.challengeMessages[guildId].delete(messageId);
	}

	cache(messageId, guildId) {
		this.checkOrInitializeCache(guildId);
		global.challengeMessages[guildId].add(messageId);
	}

	isCached(messageId, guildId) {
		this.checkOrInitializeCache(guildId);
		return global.challengeMessages[guildId].has(messageId);
	}

	checkOrInitializeCache(guildId) {
		if (!global.challengeMessages) global.challengeMessages = {};
		if (!global.challengeMessages[guildId]) global.challengeMessages[guildId] = new Set();
	}
};
