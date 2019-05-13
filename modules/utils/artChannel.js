const reactionMap = {
	like: ["👍"],
	dislike: ["👎"],
	likedislike: ["👍", "👎"],
	upvote: ["🔺"],
	downvote: ["🔻"],
	upvotedownvote: ["🔺", "🔻"]
};

module.exports = class ArtChannel extends global.utils.baseCommand {
	constructor(client) {
		super(client, {
			name: "artchannel",
			description: "Add or remove an art channel. Messages containing a link or embed will be reacted with a vote emoji in this channel.",
			group: "utils",
			memberName: "artchannel",
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			args: [
				{
					key: "enabled",
					prompt: "Whether to enable or disable artchannel.",
					type: "string",
					oneOf: ["enable", "disable"]
				},
				{
					key: "channel",
					prompt: "Channel to react in.",
					type: "channel"
				},
				{
					key: "reactionType",
					prompt: "One of the folowing:\nLike => 👍\nDislike =>👎\nLikeDislike => 👍,👎\nUpvote => 🔺\nDownvote => 🔻\nUpvoteDownvote => 🔺,🔻",
					type: "string",
					oneOf: ["like", "likedislike", "dislike", "upvote", "downvote", "upvotedownvote"],
					default: "upvote"
				}
			]
		});
	}

	async task(ctx) {
		let artchannels = await ctx.globalDb.get("artchannels") || await ctx.globalDb.set("artchannels", []);
		if (ctx.args.enabled === "enable") {
			if (artchannels.map(channel => channel.id).includes(ctx.args.channel.id)) artchannels = artchannels.filter(channel => channel.id !== ctx.args.channel.id);
			artchannels.push({
				id: ctx.args.channel.id,
				reactions: typeof reactionMap[ctx.args.reactionType.toLowerCase()] === "undefined" ? reactionMap.upvote : reactionMap[ctx.args.reactionType.toLowerCase()]
			});
		} else if (ctx.args.enabled === "disable") { artchannels = artchannels.filter(channel => channel.id !== ctx.args.channel.id); }
		await ctx.globalDb.set("artchannels", artchannels);
		await ctx.send(`Artchannel service successfully ${ctx.args.enabled === "enable" ? "set to" : "removed from"} #${ctx.args.channel.name}`);
	}
};
