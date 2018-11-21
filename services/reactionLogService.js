module.exports = class ReactionLog extends global.utils.baseService {
    constructor(client) {
        super(client, {
            name: "Reaction Log Service",
            description: "Logs reactions added to messages.",
            enabled: true
        });
    }

    // TODO: Store log channels in db and log guild data, similar to artChannelService

    async onMessageReactionAdd(ctx) {
        console.log(`${ctx.user.tag} added reaction ${ctx.reaction.emoji.name} to ${ctx.message.id} in ${ctx.channel.name}`);

    }

    async onMessageReactionRemove(ctx) {
        console.log(`${ctx.user.tag} removed reaction ${ctx.reaction.emoji.name} from ${ctx.message.id} in ${ctx.channel.name}`);
    }
};