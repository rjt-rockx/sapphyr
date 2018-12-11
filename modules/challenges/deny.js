const { RichEmbed } = require("discord.js");

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
					key: "id",
					prompt: "ID of the message to grab.",
					type: "string"
				}
			]
		});
	}
	async task(ctx) {
		const { approverRole, approverChannel, challengeData } = await ctx.db.get();
		if (!approverRole)
			return ctx.send(`Approver role not specified. Please specify an approver role using ${ctx.prefix}approverRole`);
		if (!approverChannel)
			return ctx.send(`Approver channel not specified. Please specify an approver channel using ${ctx.prefix}approverChannel`);
		if (!ctx.guild.roles.has(approverRole)) {
			await ctx.db.set("approverRole", "");
			return ctx.send("Approver role not found.");
		}
		if (!ctx.guild.channels.has(approverChannel)) {
			await ctx.db.set("approverChannel", "");
			return ctx.send("Approver channel not found.");
		}
		if (ctx.channel.id !== approverChannel)
			return ctx.send(`This command can only be used in #${ctx.guild.channels.get(approverChannel).name}`);
		if (!ctx.member.roles.has(approverRole))
			return ctx.send(`You need the ${ctx.guild.roles.get(approverRole).name} to use this command.`);
		let submission;
		try {
			submission = await ctx.channel.fetchMessage(ctx.args.id);
		}
		catch (error) {
			return ctx.send("Unable to fetch the message. Make sure the message exists in this channel.");
		}

		const timestamp = Date.now();
		const logChannel = challengeData.logChannel ? ctx.guild.channels.get(challengeData.logChannel) : null;
		if (logChannel)
			await logChannel.send(new RichEmbed({
				title: `${submission.author.tag}'s submission was denied.`,
				fields: [
					{
						name: `Challenge submission denied by ${ctx.user.tag} (${ctx.user.id}).`,
						value: `${submission.author.tag} was not rewarded anything.`
					}
				],
				footer: { text: `Submission ID: ${submission.id} | User ID: ${submission.author.id}` },
				timestamp
			}));

		await submission.author.send(new RichEmbed({
			title: "Your submission was denied!",
			fields: [
				{
					name: `Challenge submission denied by ${ctx.user.tag} (${ctx.user.id}).`,
					value: "You were not rewarded anything."
				}
			],
			footer: { text: `Submission ID: ${submission.id} | User ID: ${submission.author.id}` },
			timestamp
		}));
		return ctx.send("Challenge submission successfully denied.");
	}
};
