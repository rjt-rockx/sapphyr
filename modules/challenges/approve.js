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
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_ROLES"],
			guildOnly: true,
			args: [
				{
					key: "challengeId",
					prompt: "The ID of the challenge to approve.",
					type: "integer"
				},
				{
					key: "messages",
					prompt: "The IDs of the submission message(s) to approve.",
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
			return ctx.selfDestruct("These messages were already approved by someone else!");
		this.cache(ctx.args.messages, ctx.guild.id);
		const { approverRole, approverChannel, storageChannel } = await ctx.db.get();
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
			return ctx.send("You cannot approve your own messages!");
		}

		for (const submissionMessage of ctx.args.messages) {
			if (submissionMessage.author.id !== authorId) {
				this.uncache(ctx.args.messages, ctx.guild.id);
				return ctx.send("Messages from multiple users are not allowed.");
			}
			if (submissionMessage.author.bot) {
				this.uncache(ctx.args.messages, ctx.guild.id);
				return ctx.send("Bot messages can't be approved.");
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
							description: submissionMessage.cleanContent || "No message content.",
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

			if (attachmentLinks.length > 0) {
				let currentField = 0, totalText = "";
				const links = attachmentLinks.map(({ name, size, url }) => `[${name.length >= 30 ? name.substring(0, 27) + "..." : name} (${properRoundToTwo(size / (1024 * 1024))} MB)](${url})`);
				for (const link of links) {
					if ((totalText + link + "\n").length <= 1024)
						totalText += link + "\n";
					if ((totalText + link + "\n").length > 1024) {
						attachmentField.push({
							name: `Attachments${currentField > 0 ? " (contd.)" : ""}`,
							value: totalText
						});
						currentField += 1;
						totalText = "";
					}
				}
				if (totalText)
					attachmentField.push({
						name: `Attachments${currentField > 0 ? " (contd.)" : ""}`,
						value: totalText
					});
			}
		}

		const challengeData = await ctx.db.get("challengeData") || await ctx.db.set("challengeData", {});
		const { challenges } = challengeData;
		if (!challenges || (Array.isArray(challenges) && challenges.length < 1)) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("No challenges found.");
		}
		if (ctx.args.challengeId < 0 || !challenges.some(challenge => challenge.id === ctx.args.challengeId)) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("Invalid ID specified.");
		}
		const [challenge] = challenges.filter(({ id }) => ctx.args.challengeId === id);
		if (!challenge) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("No challenge found.");
		}
		if (!challenge.enabled) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("This challenge is currently disabled.");
		}

		if (!challengeData.users)
			challengeData.users = {};
		if (!challengeData.users[authorId])
			challengeData.users[authorId] = [];

		const uniqueChallenges = await ctx.db.get("uniqueChallenges") || await ctx.db.set("uniqueChallenges", false);
		const approvedChallenges = challengeData.users[authorId].map(entry => entry.challenge.id);

		if (uniqueChallenges && approvedChallenges.includes(ctx.args.challengeId)) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("Challenge has already been approved for this user.");
		}

		if (!ctx.nadekoConnector) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("No NadekoConnector configuration found for this guild.");
		}

		let result = await ctx.nadekoConnector.getBotInfo();
		if (result.error) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to get bot information.");
		}
		const sign = result.currency.sign;
		result = await ctx.nadekoConnector.addCurrency(authorId, challenge.reward, `[Sapphyr] Challenge #${challenge.id} approved by ${ctx.user.tag} (${ctx.user.id}) in ${ctx.guild.name} (${ctx.guild.id})`);
		if (result.error) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to award currency to the user.");
		}

		const fullMessage = ctx.args.messages.map(message => message.cleanContent).join("\n") || "No message content.";
		if (fullMessage.length > 2000) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("Combined message length must be less than or equal to 2000 characters.");
		}

		const timestamp = Date.now();
		challengeData.users[authorId].push({
			challenge, timestamp,
			proof: fullMessage,
			attachments: attachmentLinks,
			approver: {
				tag: ctx.user.tag,
				id: ctx.user.id
			}
		});

		const challengeRoles = await ctx.db.get("challengeRoles") || await ctx.db.set("challengeRoles", {});
		const amountOfChallengesCompleted = challengeData.users[authorId].length;
		const rolesField = [];

		if (challengeRoles.enabled) {
			if (!challengeRoles.roles || typeof challengeRoles.roles !== "object")
				challengeRoles.roles = {};

			const configuredChallengeRoles = Object.entries(challengeRoles.roles)
				.map(([key, value]) => [parseInt(key), value])
				.sort(([a], [b]) => a - b);
			const member = ctx.guild.members.get(authorId);

			let roleChanges = [];

			for (const [amount, role] of configuredChallengeRoles) {
				if (!ctx.guild.roles.has(role)) {
					delete challengeRoles.roles[amount];
					continue;
				}
				if (amountOfChallengesCompleted >= amount) {
					if (!challengeRoles.stacked)
						roleChanges.forEach(e => e.action = "-");
					roleChanges.push({ amount, role, action: "+" });
				}
			}

			roleChanges = roleChanges.filter(entry => {
				if (entry.action === "+" && member.roles.has(entry.role)) return false;
				else if (entry.action === "-" && !member.roles.has(entry.role)) return false;
				else return true;
			});

			try {
				if (roleChanges.length > 0) {
					const rolesToAdd = roleChanges.filter(entry => entry.action === "+").map(entry => ctx.guild.roles.get(entry.role));
					await member.addRoles(rolesToAdd, "Adding challenge roles.");

					const rolesToRemove = roleChanges.filter(entry => entry.action === "-").map(entry => ctx.guild.roles.get(entry.role));
					await member.removeRoles(rolesToRemove, "Removing challenge roles.");

					rolesField.push({
						name: `Role Changes (${roleChanges.length})`,
						value: roleChanges.map(entry => `${entry.action}${ctx.guild.roles.get(entry.role).name}`).join(", ")
					});
				}
			}
			catch (err) {
				ctx.selfDestruct("Error adding challenge roles to this user; ignoring.");
			}

			await ctx.db.set("challengeRoles", challengeRoles);
		}

		const logChannel = challengeData.logChannel ? ctx.guild.channels.get(challengeData.logChannel) : null;
		if (logChannel) {
			await logChannel.send({
				embed: new RichEmbed({
					author: { name: `${ctx.args.messages[0].author.tag}'s submission was approved.` },
					title: "Message Content",
					description: fullMessage || "No message content.",
					thumbnail: { url: ctx.args.messages[0].author.displayAvatarURL },
					fields: [
						{
							name: `Challenge #${challenge.id}`,
							value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
						},
						{
							name: `Approved by ${ctx.user.tag} (${ctx.user.id}).`,
							value: `${ctx.args.messages[0].author.tag} was rewarded ${challenge.reward} ${sign}!`
						},
						...attachmentField, ...rolesField
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
					author: { name: "Your submission was approved." },
					title: "Message Content",
					description: fullMessage || "No message content.",
					thumbnail: { url: ctx.user.displayAvatarURL },
					fields: [
						{
							name: `Challenge #${challenge.id}`,
							value: `[${toTitleCase(challenge.difficulty)}] ${challenge.challenge}`
						},
						{
							name: `Approved by ${ctx.user.tag} (${ctx.user.id}).`,
							value: `You were rewarded ${challenge.reward} ${sign}!`
						},
						...attachmentField, ...rolesField
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

		const approverStats = await ctx.db.get("approverStats") || await ctx.db.set("approverStats", {});
		if (!Array.isArray(approverStats[ctx.user.id]))
			approverStats[ctx.user.id] = [];
		approverStats[ctx.user.id].push({ type: "approval", reward: challenge.reward, timestamp });
		await ctx.db.set("approverStats", approverStats);

		await ctx.message.delete();
		await Promise.all(ctx.args.messages.map(message => message.delete()));
		this.uncache(ctx.args.messages, ctx.guild.id);
		return ctx.selfDestruct("Challenge submission successfully approved.");
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