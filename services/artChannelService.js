const urlRegex = require("url-regex-local")({ exact: false, strict: false });

module.exports = class ArtChannel extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Art Channel Service",
			description: "Adds upvote/downvote/like/dislike reactions on messages containing a link, embed or attachment.",
			enabled: true
		});
	}

	async onMessage(ctx) {
		if (ctx.message.author.bot) return;
		const artchannels = await ctx.globalDb.get("artchannels");
		if (!artchannels) return ctx.globalDb.set("artchannels", []);
		const index = artchannels.map(channel => channel.id).indexOf(ctx.channel.id);
		if (index > -1)
			if (ctx.message.attachments.size > 0 || ctx.message.embeds.length > 0 || urlRegex.test(ctx.message.cleanContent))
				for (const reaction of artchannels[index].reactions)
					await ctx.message.react(reaction);
	}
};
