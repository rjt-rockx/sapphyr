const { Command } = require("discord.js-commando");
module.exports = class SaveGlobalDataCommand extends global.utils.baseCommand {
    constructor(client) {
        super(client, {
            name: "saveglobaldata",
            description: "Saves some data globally",
            group: "utils",
            memberName: "saveglobaldata",
            userPermissions: ["ADMINISTRATOR"],
            args: [
                {
                    key: "key",
                    prompt: "Key to store the data under",
                    type: "string",
                    default: "data"
                },
                {
                    key: "value",
                    prompt: "Value to store",
                    type: "string"
                }
            ]
        });
    }

    async task(ctx) {
        await ctx.globalDb.set(ctx.args.key, ctx.args.value);
        await ctx.message.channel.send("Data successfully saved!");
    }
};
