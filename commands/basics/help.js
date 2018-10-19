var { Command } = require("discord.js-commando");
var { RichEmbed } = require("discord.js");
module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: "help",
			description: "Gives help for a command.",
			group: "basics",
			memberName: "help"
		});
	}

	async run(msg, args) {
		var embed = new RichEmbed();

		var page = 0;
		var name = false;
		var group = false;

		var objects = global.client.registry.commands.array();
		var list = new Array();

		if (!isNaN(args) && args != "") {
			page = parseInt(args) - 1;
		}

		else {
			for (let o in objects) {
				if (args == objects[o].name) {
					name = true;
				}

				else if (args == objects[o].groupID) {
					group = true;
				}
			}

			if (name) {
				var object;
				for (let o in objects) {
					if (args == objects[o].name) {
						object = objects[o];
					}
				}

				embed.setTitle(object.name);
				embed.addField("description", object.description, true);
				embed.addField("group", object.groupID, true);
				embed.addField("aliases", JSON.stringify(object.aliases), true);
				embed.addField("nsfw", object.nsfw);
			}

			else if (group) {
				for (let o in objects) {
					if (args == objects[o].groupID) {
						list.push(objects[o]);
					}
				}

				if (!isNaN(args.split(" ")[1])) {
					var pg = parseInt(args.split(" ")[1]);
				}
			}
		}

		if (!name && !group) {
			for (let o in objects) {
				list.push(objects[o]);
			}
		}

		var maxPage = Math.ceil(list.length / 10) - 1;

		if (!name) {
			if (page < -1) {
				embed.setDescription("please specify a larger number");
			}

			else if (page > maxPage) {
				embed.setDescription("please specify a smaller page number");
			}
		}

		else {
			for (var i = 0; i < 10; i++) {
				if (list[(page * 10) + i]) {
					embed.addField(list[(page * 10) + i].name, list[(page * 10) + i].description);
				}
			}

			if (!name) {
				embed.setFooter("page " + (page + 1) + " / " + (maxPage + 1));
			}
		}

		msg.channel.send(embed);
	}
};
