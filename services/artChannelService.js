module.exports = class ArtChannelService extends global.utils.baseService {
	constructor(client) {
		super(client);
	}

	onMessage(message) {
		if (message.guild.channels.find(c => c.name === "art"))
			if (message.channel.id === message.guild.channels.find(c => c.name === "art").id && message.attachments.size > 0)
				message.react("🔺");
	}
};

