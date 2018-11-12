module.exports = class ArtChannelService extends global.utils.baseService {
	constructor(client) {
		super(client);
	}

	onMessage(ctx) {
		if (ctx.guild.channels.find(c => c.name === "art"))
			if (ctx.channel.id === ctx.guild.channels.find(c => c.name === "art").id && ctx.message.attachments.size > 0)
				ctx.message.react("🔺");
	}
};

