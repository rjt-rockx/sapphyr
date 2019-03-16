const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const DiscordColors = global.utils.colors.numbers.discord;
const { RichEmbed } = require("discord.js");

module.exports = class RemoveChallenge extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "removechallenge",
			description: "Remove the latest challenge entry of a particular challenge from a user.",
			group: "challenges",
			memberName: "removechallenge",
			aliases: ["rch"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "id",
					prompt: "ID of the challenge.",
					type: "integer"
				},
				{
					key: "user",
					prompt: "User to remove the challenge entry from.",
					type: "user"
				}
			]
		});
	}

	async task(ctx) {
		const approverRole = await ctx.db.get("approverRole") || await ctx.db.set("approverRole", "");
		if (!approverRole)
			return ctx.send(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			return ctx.send("Approver role not found.");
		}
		if (!ctx.member.roles.has(approverRole))
			return ctx.send(`You need the ${ctx.guild.roles.get(approverRole).name} role to use this command.`);

		if (ctx.args.user.id === ctx.user.id)
			return ctx.send("You cannot remove your own challenges.");

		if (!ctx.nadekoConnector)
			return ctx.send("NadekoConnector configuration not set.");
		const botInfo = await ctx.nadekoConnector.getBotInfo();
		if (typeof botInfo.bot.currency.sign === "undefined")
			return ctx.send("Unable to parse NadekoConnector information.");

		const challengeData = await ctx.db.get("challengeData");
		if (!challengeData.challenges || (Array.isArray(challengeData.challenges) && challengeData.challenges.length < 1))
			return ctx.send("No challenges found.");
		if (ctx.args.id < 0 || !challengeData.challenges.some(challenge => challenge.id === ctx.args.id))
			return ctx.send("Invalid ID specified.");
		if (!challengeData.users[ctx.args.user.id])
			challengeData.users[ctx.args.user.id] = [];

		let challengeHistory = challengeData.users[ctx.args.user.id];
		const index = challengeHistory.findIndex(entry => entry.challenge.id === ctx.args.id);
		if (index < 0)
			return ctx.send("No challenge entry found for the given user and challenge ID.");

		const challengeEntry = challengeHistory[index];
		if (challengeEntry.timestamp < (Date.now() - (7 * 24 * 60 * 60 * 1000)))
			return ctx.send("Challenge entry is too old to be removed.");
		challengeHistory = challengeHistory.splice(index, 1);

		const response = await ctx.nadekoConnector.subtractCurrency(ctx.args.user.id, challengeEntry.challenge.reward, `[Sapphyr] Removed challenge #${challengeEntry.challenge.id}.`);
		const currencyText = !response.error ? `${challengeEntry.challenge.reward} ${botInfo.bot.currency.sign} was deducted from ${ctx.args.user.tag}` : `Unable to deduct currency from ${ctx.args.user.tag}`;

		await ctx.db.set("challengeData", challengeData);

		const logChannel = challengeData.logChannel ? ctx.guild.channels.get(challengeData.logChannel) : null;

		try {
			await ctx.args.user.send(new RichEmbed({
				title: `Your challenge entry #${challengeEntry.challenge.id} was successfully removed.`,
				thumbnail: { url: ctx.user.displayAvatarURL },
				description: currencyText,
				color: DiscordColors.yellow,
				fields: [
					{
						name: `Challenge #${challengeEntry.challenge.id}`,
						value: `[${toTitleCase(challengeEntry.challenge.difficulty)}] ${challengeEntry.challenge.challenge}`
					},
					{
						name: `Removed by ${ctx.user.tag} (${ctx.user.id})`,
						value: `Originally approved by ${challengeEntry.approver.tag} (${challengeEntry.approver.id})`
					},
					{
						name: "Submitted on",
						value: `${new Date(challengeEntry.timestamp).toISOString().replace(/[TZ]/g, " ")}`
					}
				],
				timestamp: new Date()
			}));
		}
		catch (error) {
			await ctx.selfdestruct("Unable to DM user, ignoring.");
		}

		if (logChannel) {
			await logChannel.send(new RichEmbed({
				title: `Challenge entry #${challengeEntry.challenge.id} successfully removed.`,
				thumbnail: { url: ctx.args.user.displayAvatarURL },
				description: currencyText,
				color: DiscordColors.yellow,
				fields: [
					{
						name: `Challenge #${challengeEntry.challenge.id}`,
						value: `[${toTitleCase(challengeEntry.challenge.difficulty)}] ${challengeEntry.challenge.challenge}`
					},
					{
						name: `Submitted by ${ctx.args.user.tag} (${ctx.args.user.id})`,
						value: `On ${new Date(challengeEntry.timestamp).toISOString().replace(/[TZ]/g, " ")}`
					},
					{
						name: `Removed by ${ctx.user.tag} (${ctx.user.id})`,
						value: `Originally approved by ${challengeEntry.approver.tag} (${challengeEntry.approver.id})`
					}
				],
				timestamp: new Date()
			}));
		}
		return ctx.send("Challenge entry successfully removed from the given user.");
	}
};
