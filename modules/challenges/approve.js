const { RichEmbed, Attachment } = require("discord.js");
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const DiscordColors = global.utils.colors.numbers.discord;
const properRoundToTwo = num => +(Math.round(num + "e+2") + "e-2");

module.exports = class ApproveCommand extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "approve",
			memberName: "approve",
			aliases: ["approvechallenge", "ach"],
			group: "challenges",
			description: "Approve a challenge and award the submitter.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			guildOnly: true,
			args: [
				{
					key: "messageId",
					prompt: "The ID of the submission message to approve.",
					type: "string"
				},
				{
					key: "challengeId",
					prompt: "The ID of the challenge to approve.",
					type: "integer"
				}
			]
		});
	}
	async task(ctx) {
		if (this.isCached(ctx.args.messageId, ctx.guild.id))
			return ctx.selfDestruct("This message was already approved by someone else!");
		this.cache(ctx.args.messageId, ctx.guild.id);
		const { approverRole, approverChannel, storageChannel } = await ctx.db.get();
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
		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", {});
		let submission;
		try { submission = await ctx.channel.fetchMessage(ctx.args.messageId); }
		catch (error) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Unable to fetch the message. Make sure the message exists in this channel.");
		}
		if (submission.author.id === ctx.user.id) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("You cannot approve your own messages!");
		}
		if (submission.author.bot) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Bot messages can't be approved.");
		}

		let attachments = [], attachmentLinks = [];
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
				attachmentLinks = [...attachmentMessage.attachments.values()].map(({ filename, filesize, url }) => ({ name: filename, size: filesize, url }));
				attachments = [{
					name: "Attachments",
					value: [...attachmentMessage.attachments.values()].map(attachment => `[${attachment.filename} (${properRoundToTwo(attachment.filesize / (1024 * 1024))} MB)](${attachment.url})`).join("\n")
				}];
			}
		}

		const { challenges } = challengeData;
		if (!challenges || (Array.isArray(challenges) && challenges.length < 1)) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("No challenges found.");
		}
		if (ctx.args.challengeId < 0 || !challenges.some(challenge => challenge.id === ctx.args.challengeId)) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Invalid ID specified.");
		}
		const [challenge] = challenges.filter(({ id }) => ctx.args.challengeId === id);
		if (!challenge) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("No challenge found.");
		}
		if (!challenge.enabled) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("This challenge is currently disabled.");
		}

		if (!challengeData.users)
			challengeData.users = {};
		if (!challengeData.users[submission.author.id])
			challengeData.users[submission.author.id] = [];

		const uniqueChallenges = await ctx.db.get("uniqueChallenges") || await ctx.db.set("uniqueChallenges", false);
		const approvedChallenges = challengeData.users[submission.author.id].map(entry => entry.challenge.id);
		if (uniqueChallenges && approvedChallenges.includes(ctx.args.challengeId)) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("Challenge has already been approved for this user.");
		}

		if (!ctx.nadekoConnector) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			return ctx.send("No NadekoConnector configuration found for this guild.");
		}

		let result = await ctx.nadekoConnector.getBotInfo();
		if (result.error) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to get bot information.");
		}
		const sign = result.bot.currency.sign;
		result = await ctx.nadekoConnector.addCurrency(submission.author.id, challenge.reward, `[Sapphyr] Challenge #${challenge.id} approved by ${ctx.user.tag} (${ctx.user.id}) in ${ctx.guild.name} (${ctx.guild.id})`);
		if (result.error) {
			this.uncache(ctx.args.messageId, ctx.guild.id);
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to award currency to the user.");
		}

		const timestamp = Date.now();
		challengeData.users[submission.author.id].push({
			challenge, timestamp,
			proof: submission.cleanContent,
			attachments: attachmentLinks,
			approver: {
				tag: ctx.user.tag,
				id: ctx.user.id
			}
		});

		const logChannel = challengeData.logChannel ? ctx.guild.channels.get(challengeData.logChannel) : null;
		if (logChannel)
			await logChannel.send({
				embed: new RichEmbed({
					author: { name: `${submission.author.tag}'s submission was approved.` },
					title: "Message Content",
					description: submission.cleanContent,
					thumbnail: { url: submission.author.displayAvatarURL },
					fields: [
						{
							name: `Challenge #${challenge.id}`,
							value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
						},
						{
							name: `Approved by ${ctx.user.tag} (${ctx.user.id}).`,
							value: `${submission.author.tag} was rewarded with ${challenge.reward} ${sign}!`
						},
						...attachments
					],
					color: DiscordColors.green,
					footer: { text: `User ID: ${submission.author.id}` },
					timestamp
				})
			});

		await ctx.db.set("challengeData", challengeData);
		await submission.author.send({
			embed: new RichEmbed({
				author: { name: "Your submission was approved!" },
				title: "Message Content",
				description: submission.cleanContent,
				thumbnail: { url: submission.author.displayAvatarURL },
				fields: [
					{
						name: `Challenge #${challenge.id}`,
						value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
					},
					{
						name: `Approved by ${ctx.user.tag} (${ctx.user.id}).`,
						value: `You were rewarded with ${challenge.reward} ${sign}!`
					},
					...attachments
				],
				color: DiscordColors.green,
				footer: { text: `User ID: ${submission.author.id}` },
				timestamp
			})
		});
		await ctx.message.delete();
		await submission.delete();
		this.uncache(ctx.args.messageId, ctx.guild.id);
		return ctx.selfDestruct("Challenge submission successfully approved.");
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