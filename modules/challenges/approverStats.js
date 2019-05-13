const sum = arr => arr.reduce((a, b) => a + b, 0);

module.exports = class ApproverStats extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "approverstats",
			memberName: "approverstats",
			aliases: ["apprstats"],
			group: "challenges",
			description: "Shows stats about a particular approver.",
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			guildOnly: true,
			args: [
				{
					key: "approver",
					prompt: "Approver to get the stats of",
					type: "member",
					default: "self"
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

		const targetMember = typeof ctx.args.approver === "string" ? ctx.member : ctx.args.approver;
		const approverStats = await ctx.db.get("approverStats") || await ctx.db.set("approverStats", {});
		if (!Object.keys(approverStats).includes(targetMember.user.id))
			return ctx.send("No approver stats found for this user.");

		if (!ctx.nadekoConnector) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			return ctx.send("No NadekoConnector configuration found for this guild.");
		}

		const result = await ctx.nadekoConnector.getBotInfo();
		if (result.error) {
			this.uncache(ctx.args.messages, ctx.guild.id);
			console.log(`[Error] NadekoConnector: ${result.message}`);
			return ctx.send("Unable to get bot information.");
		}
		const sign = result.currency.sign;

		const stats = this.parseStats(approverStats[targetMember.user.id]);
		return ctx.embed({
			title: `Approver stats of ${targetMember.user.tag}`,
			thumbnail: { url: targetMember.user.displayAvatarURL },
			fields: [
				{
					name: "Overall stats",
					value: [
						`${stats.total.approvals} submissions approved.	`,
						`${stats.total.denials} submissions denied.`,
						`${stats.total.rewarded} ${sign} given out.`
					].join("\n")
				},
				{
					name: "Stats for the past 48h",
					value: [
						`${stats.recent.approvals} submissions approved.`,
						`${stats.recent.denials} submissions denied.`,
						`${stats.recent.rewarded} ${sign} given out.`
					].join("\n")
				}
			]
		});
	}

	parseStats(stats) {
		const recentStats = stats.filter(entry => entry.timestamp >= Date.now() - (24 * 60 * 60 * 1000 * 2));
		return {
			total: {
				approvals: stats.filter(entry => entry.type === "approval").length,
				denials: stats.filter(entry => entry.type === "denial").length,
				rewarded: sum(stats.filter(entry => entry.type === "approval").map(a => a.reward))
			},
			recent: {
				approvals: recentStats.filter(entry => entry.type === "approval").length,
				denials: recentStats.filter(entry => entry.type === "denial").length,
				rewarded: sum(recentStats.filter(entry => entry.type === "approval").map(a => a.reward))
			}
		};
	}
};