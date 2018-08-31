module.exports = {
    name: "ping",
    help: "Check the bot's latency.",
    usages: "{prefix}ping",
    task: async function (message) {
        let newMessage = await message.channel.createMessage("🔁 | Pinging ...");
        await newMessage.edit(`✅ | Ping: ${Date.now() - newMessage.timestamp}ms. `);
    },
    settings: {
        aliases: [],
        caseInsensitive: true,
        requirements: {}
    }
};
