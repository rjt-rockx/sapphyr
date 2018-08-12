var Discord = require('discord.js');
var client = new Discord.Client();
var config = require("./localdata/config.json");
var utils = require("./utils/utils.js");
var fs = require("fs");
bot.commands = new Discord.Collection();



fs.readdir("./commands/", (err, files) => {
	if(err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

jsfile.forEach((f, i) =>{
  let files = require(`./commands/${f}`);
  console.log(`${f} has been loaded successfully.`);
  if (files.help && files.help.name) {
    bot.commands.set(files.help.name, files);
  } else {
    console.error(`File: ${f} does not have module.exports.help name property, therefor command cannot be loaded.`);
         }
    });
});

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	var activity = [
	"s.help",
	"over Sinbad Knights"
];
	setInterval(() => {
        const index = Math.floor(Math.random() * (activity.length - 1) + 1);
        client.user.setActivity(activity[index] { type:'WATCHING' }); 
    }, 30000); 
});

client.on('message', msg => {
	
  let msgArray = msg.content.split(" ");
  let cmd = msgArray[0];
  let args = msgArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(client, msg, args)
	
});




client.login(config.token);
