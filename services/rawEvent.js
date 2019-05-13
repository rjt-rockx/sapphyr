const { MessageReaction, Emoji } = require("discord.js");
module.exports = class RawEvent extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Raw Events Service",
			description: "Handles undocumented raw events and parses them into documented ones.",
			enabled: true
		});
	}

	async parseRawReactionEvent(ctx) {
		const user = this.client.users.get(ctx.data.userId);
		const channel = this.client.channels.get(ctx.data.channelId) || await user.createDM();
		const guild = this.client.guilds.get(ctx.data.guildId);
		if (!user || !channel || !guild) return;
		if (channel.messages.has(ctx.data.messageId)) return;
		let emoji = ctx.data.emoji;
		if (emoji && emoji.id) {
			if (this.client.emojis.has(emoji.id))
				emoji = this.client.emojis.get(emoji.id);
			if (guild.available && guild.emojis && guild.emojis.has(emoji.id))
				emoji = new Emoji(guild, emoji);
		}
		const message = await channel.fetchMessage(ctx.data.messageId);
		if (!message) return;
		let reaction = ctx.type === "messageReactionAdd" ? message._addReaction(emoji, user) : !message._removeReaction(emoji, user);
		if (reaction) {
			if (!(reaction instanceof MessageReaction))
				reaction = new MessageReaction(message, emoji, 0, ctx.data.userId === this.client.user.id);
			this.client.emit(ctx.type, reaction, user);
		}
	}

	onRaw(ctx) {
		if (!ctx.type) return;
		if (["messageReactionAdd", "messageReactionRemove"].includes(ctx.type))
			return this.parseRawReactionEvent(ctx);
	}
};
