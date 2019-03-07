const { Command } = require("discord.js-commando"),
	log = require("fancy-log");

module.exports = class BaseCommand extends Command {
	constructor(client, commandInfo) {
		super(client, {
			...commandInfo,
			memberName: commandInfo.memberName || commandInfo.name
		});
	}

	async run(...args) {
		const context = await global.utils.fetchContext(this.client, "commandMessage", args);
		await this.task(context);
		log(`Command ${context.command.name} was executed by user ${context.user.tag} (${context.user.id}).`);
	}
};