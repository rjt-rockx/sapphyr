const { MessageReaction, Emoji } = require("discord.js");

module.exports = class RawEvent extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Raw Events Service",
			description: "Handles undocumented raw events and parses them into documented ones.",
			enabled: true,
		});
	}

	async parseRawReactionEvent(ctx) {
		const user = this.client.users.get(ctx.data.userId);
		const channel = this.client.channels.get(ctx.data.channelId) || await user.createDM();
		if (channel.messages.has(ctx.data.messageId)) return;
		const message = await channel.fetchMessage(ctx.data.messageId);
		let reaction = ctx.type === "messageReactionAdd" ? message._addReaction(ctx.data.emoji, user) : !message._removeReaction(ctx.data.emoji, user);
		if (reaction) {
			if (!(reaction instanceof MessageReaction)) {
				const emoji = new Emoji(this.client.guilds.get(ctx.data.guildId), ctx.data.emoji);
				reaction = new MessageReaction(message, emoji, 0, ctx.data.userId === this.client.user.id);
			}
			this.client.emit(ctx.type, reaction, user);
		}
	}

	onRaw(ctx) {
		if (!ctx.type) return null;
		if (["messageReactionAdd", "messageReactionRemove"].includes(ctx.type)) return this.parseRawReactionEvent(ctx);
		return null;
	}
};
