module.exports = class ReactionLog extends global.utils.baseService {
    constructor(client) {
        super(client, {
            name: "Reaction Log Service",
            description: "Logs reactions added to messages.",
            enabled: true
        });
    }

    async onMessageReactionAdd(ctx) {
        if (!ctx || !ctx.db || ctx.user.bot || !ctx.user || !ctx.reaction) return;
        let logChannel = await ctx.db.get("reactionLogChannel");
        if (this.client.channels.has(logChannel)) {
            this.client.channels.get(logChannel).send({
                embed: {
                    author: {
                        icon: ctx.user.displayAvatarURL,
                        name: `${ctx.user.tag} added a reaction`
                    },
                    title: "Message",
                    description: ctx.reaction.message.content,
                    fields: [
                        {
                            name: "Emoji",
                            value: ctx.reaction.emoji.toString()
                        }
                    ],
                    footer: {
                        text: `Message ID: ${ctx.reaction.message.id} | User ID: ${ctx.user.id}`
                    }
                }
            });
        }
    }

    async onMessageReactionRemove(ctx) {
        if (!ctx || !ctx.db || ctx.user.bot || !ctx.user || !ctx.reaction) return;
        let logChannel = await ctx.db.get("reactionLogChannel");
        if (this.client.channels.has(logChannel))
            this.client.channels.get(logChannel).send({
                embed: {
                    author: {
                        icon: ctx.user.displayAvatarURL,
                        name: `${ctx.user.tag} removed a reaction`
                    },
                    title: "Message",
                    description: ctx.reaction.message.content,
                    fields: [
                        {
                            name: "Emoji",
                            value: ctx.reaction.emoji.toString()
                        }
                    ],
                    footer: {
                        text: `Message ID: ${ctx.reaction.message.id} | User ID: ${ctx.user.id}`
                    }
                }
            });
    }
};