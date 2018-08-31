var eris = require("eris");
var config = require("./localdata/config.json");
var path = require("path");
var bot = new eris.CommandClient(config.bot.token, {
  autoreconnect: true,
  getAllUsers: true,
  disableEveryone: false
}, {
    description: "A test bot made with Eris",
    owner: config.owners,
    prefix: "s.",
    defaultHelpCommand: false
  });

require("fs").readdirSync(path.resolve("./commands")).forEach(function (file) {
  let command = require("./commands/" + file);
  bot.registerCommand(command.name, command.task, command.settings);
});

bot.on("ready", () => {
  console.log("Ready!");
});


bot.connect();