const log = require("fancy-log");

module.exports = class TimedEvent extends global.utils.baseService {
	constructor(client) {
		super(client, {
			name: "Timed Event Service",
			description: "Prints 'Hello from the other side.' in console every minute.",
			enabled: false
		});
	}

	everyMinute() {
		log("Hello from the other side.");
	}
};
