var { Command } = require("discord.js-commando");
module.exports = class SaveDataCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "showdata",
            description: "Shows stored data",
            group: "utils",
            memberName: "showdata",
            args: [
                {
                    key: "key",
                    prompt: "Key that the data was stored under",
                    type: "string",
                    default: "data"
                }
            ]
        });
    }

    async task(ctx) {
        let data = await ctx.db.get(ctx.args.key);
        if (typeof data === "undefined")
            data = "No value was set for this key!";
        await ctx.message.channel.send(typeof data === "string" ? data : JSON.stringify(data));
    }
};
