var fs = require("fs");
var path = require("path");
let commands = [];
fs.readdirSync(path.resolve("./commands")).forEach(function (file) {
    let command = require(path.resolve("./commands/" + file));
    commands.push(command);
});

let listcmds =  {
    name: "commands",
    help: "Display a list of all commands in the bot.",
    usages: "{prefix}commands",
    task: async function (message) {
        let commandNames = [];
        for (let command of commands) {
            commandNames.push(command.name);
        }
        await message.channel.createMessage({
            embed: {
                title: "Commands",
                description: commandNames.sort().join("\n")
            }
        });
    },
    settings: {
        aliases: [],
        caseInsensitive: true,
        requirements: {}
    }
};

commands.push(listcmds);
commands.push(require(path.resolve("./help.js")));
module.exports = listcmds;