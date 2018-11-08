var { Command } = require("discord.js-commando");
module.exports = class SaveDataCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "removedata",
            description: "Removes stored data",
            group: "utils",
            memberName: "removedata",
            userPermissions: ["ADMINISTRATOR"],
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
        let data = await ctx.db.remove(ctx.args.key);
        await ctx.message.channel.send("Data successfully removed!");
    }
};
