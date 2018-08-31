var fs = require("fs");
var path = require("path");
let commands = [];
fs.readdirSync(path.resolve("./commands")).forEach(function (file) {
    let command = require(path.resolve("./commands/" + file));
    commands.push(command);
});

var helpCommand = {
    name: "help",
    help: "Get help for a specific command.",
    usages: ["{prefix}help", "{prefix}help commandName"],
    task: async function (message, args) {
        if (args.length <= 0) {
            await message.channel.createMessage("ℹ | Type `s.help commandName` to get help for a specific command.");
            return;
        }
        let prefix = message.prefix;
        for (let command of commands) {
            if (args[0].toLowerCase() === command.name) {
                await message.channel.createMessage({
                    embed: {
                        title: prefix + command.name,
                        description: command.help,
                        fields: [
                            {
                                name: `Usage${(Array.isArray(command.usages) && command.usages.length > 1) ? "s" : ""}`,
                                value: (Array.isArray(command.usages) && command.usages.length > 1) ? command.usages.join("\n").replace(/{prefix}/gi, prefix) : command.usages.toString().replace(/{prefix}/gi, prefix)
                            }
                        ]
                    }
                });
            }
        }
    },
    settings: {
        aliases: [],
        caseInsensitive: true,
        requirements: {}
    }
};

commands.push(helpCommand);
module.exports = helpCommand;