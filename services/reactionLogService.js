const got = require("got");
const { RichEmbed } = require("discord.js");
module.exports = class ReactionLog extends global.utils.baseService {
    constructor(client) {
        super(client, {
            name: "Reaction Log Service",
            description: "Logs reactions added to messages.",
            enabled: true
        });
    }

    async onMessageReactionAdd(ctx) {
        if (!ctx || !ctx.db || ctx.user.bot || !ctx.user || !ctx.reaction || ctx.reaction.message.author.bot) return;
        let logChannel = await ctx.db.get("reactionLogChannel");
        let url = await getUrl(ctx.reaction.emoji);
        if (this.client.channels.has(logChannel)) {
            let embedData = new RichEmbed()
                .setAuthor(`${ctx.user.tag} added a reaction`, ctx.user.displayAvatarURL)
                .setThumbnail(url)
                .setTitle("Message")
                .setDescription(ctx.reaction.message.content || "[Embed]")
                .addField("Sent by", ctx.reaction.message.author.tag, true)
                .addField("Emoji", ctx.reaction.emoji.name, true)
                .setFooter(`Message ID: ${ctx.reaction.message.id} | User ID: ${ctx.user.id}`);
            this.client.channels.get(logChannel).send(embedData);
        }
    }

    async onMessageReactionRemove(ctx) {
        if (!ctx || !ctx.db || ctx.user.bot || !ctx.user || !ctx.reaction || ctx.reaction.message.author.bot) return;
        let logChannel = await ctx.db.get("reactionLogChannel");
        let url = await getUrl(ctx.reaction.emoji);
        if (this.client.channels.has(logChannel)) {
            let embedData = new RichEmbed()
                .setAuthor(`${ctx.user.tag}'s reaction was removed`, ctx.user.displayAvatarURL)
                .setThumbnail(url)
                .setTitle("Message")
                .setDescription(ctx.reaction.message.content || "[Embed]")
                .addField("Sent by", ctx.reaction.message.author.tag, true)
                .addField("Emoji", ctx.reaction.emoji.name, true)
                .setFooter(`Message ID: ${ctx.reaction.message.id} | User ID: ${ctx.user.id}`);
            this.client.channels.get(logChannel).send(embedData);
        }
    }
};

async function getUrl(emoji) {
    if (emoji.id) {
        let response = await got.get(`https://cdn.discordapp.com/emojis/${emoji.id}.gif`).catch(() => { });
        if (response && response.statusCode && response.statusCode === 200)
            return `https://cdn.discordapp.com/emojis/${emoji.id}.gif`;
        return `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
    }
    return `https://raw.githack.com/twitter/twemoji/v2.3.0/2/72x72/${emoji.name.codePointAt(0).toString(16)}.png`;
}