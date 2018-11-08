const { CommandGroup } = require("discord.js-commando");

module.exports = class BaseModule extends CommandGroup {
    constructor(client, details) {
        super(client, details.id, details.name, details.guarded);
        this.description = details.description;
    }
};
