const log = require("fancy-log");

module.exports = class TimedEventService extends global.utils.baseService {
    constructor(client) {
        super(client);
    }

    everyMinute() {
        log("Hello from the other side.");
    }
};