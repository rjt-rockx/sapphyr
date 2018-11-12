const log = require("fancy-log");

module.exports = class ExampleService extends global.utils.baseService {
    constructor(client) {
        super(client);
    }

    onMessage(ctx) {
        log(`${ctx.user.tag} sent ${ctx.message.toString()} in ${ctx.channel.name}`);
    }
};