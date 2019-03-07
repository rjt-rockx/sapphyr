const { readdirSync } = require("fs"), { join } = require("path");
const onText = str => str.replace(/\w\S*/g, txt => "on" + txt.charAt(0).toUpperCase() + txt.substr(1));
const everyText = str => str.replace(/\w\S*/g, txt => "every" + txt.charAt(0).toUpperCase() + txt.substr(1));
const deepProps = x => x && x !== Object.prototype && Object.getOwnPropertyNames(x).concat(deepProps(Object.getPrototypeOf(x)) || []);
const deepFunctions = x => deepProps(x).filter(name => typeof x[name] === "function");
const userFunctions = x => new Set(deepFunctions(x).filter(name => name !== "constructor" && !~name.indexOf("__")));

const intervals = {
	minute: 60,
	fiveMinutes: 300,
	fifteenMinutes: 900,
	halfAnHour: 1800,
	hour: 3600,
	day: 86400
};
module.exports = class serviceHandler {
	constructor(client) {
		this.client = client;
		this.services = [];
		this.events = [
			"channelCreate",
			"channelDelete",
			"channelPinsUpdate",
			"channelUpdate",
			"emojiCreate",
			"emojiDelete",
			"emojiUpdate",
			"guildBanAdd",
			"guildBanRemove",
			"guildCreate",
			"guildDelete",
			"guildIntegrationsUpdate",
			"guildMemberAdd",
			"guildMemberRemove",
			"guildMemberSpeaking",
			"guildMemberUpdate",
			"guildUpdate",
			"message",
			"messageDelete",
			"messageDeleteBulk",
			"messageReactionAdd",
			"messageReactionRemove",
			"messageReactionRemoveAll",
			"messageUpdate",
			"presenceUpdate",
			"raw",
			"roleCreate",
			"roleDelete",
			"roleUpdate",
			"typingStart",
			"typingStop",
			"userUpdate",
			"voiceStateUpdate",
			"webhookUpdate"
		];
	}

	checkIfValid(service) {
		return service.prototype instanceof global.utils.baseService;
	}

	addService(service) {
		if (!this.checkIfValid(service)) return;
		const serviceToAdd = new service(this.client);
		if (this.services.some(existingService => existingService.id === serviceToAdd.id)) return;
		this.services.push(serviceToAdd);
	}

	addServicesIn(folder) {
		for (const filename of readdirSync(folder))
			if (filename.match(/\.js$/) !== null && filename !== "index.js") {
				const service = require(join(folder, filename));
				this.addService(service);
			}
	}

	listServices() {
		return this.services.map(service => { return { id: service.id, enabled: service.enabled }; });
	}

	enableService(id) {
		for (const service of this.services)
			if (service.id === id && !service.enabled)
				service.enable();
	}

	disableService(id) {
		for (const service of this.services)
			if (service.id === id && service.enabled)
				service.disable();
	}

	getServiceInfo(id) {
		for (const service of this.services)
			if (service.id === id)
				return {
					name: service.name,
					description: service.description,
					enabled: service.enabled
				};
	}

	removeService(service) {
		this.services = this.services.filter(existingService => existingService.id !== service.id);
	}

	removeAllServices() {
		this.services = [];
	}

	async runClientEvent(event, args) {
		for (const service of this.services)
			if (typeof service[onText(event)] === "function" && service.enabled) {
				const context = await global.utils.fetchContext(this.client, event, args);
				if (typeof context !== "undefined")
					service[onText(event)](context);
			}
	}

	async runTimedEvent(event, args) {
		for (const service of this.services)
			if (typeof service[everyText(event)] === "function" && service.enabled) {
				const context = await global.utils.fetchContext(this.client, event, args);
				if (typeof context !== "undefined")
					service[everyText(event)](context);
			}
	}

	registerClientEvents() {
		this.usedEvents = this.services.reduce((events, service) => events.concat([...userFunctions(service)]), [])
			.filter(eventName => eventName.startsWith("on") || eventName.startsWith("every"))
			.sort().filter((eventName, index, self) => self.indexOf(eventName) === index);
		this.clientEvents = this.events.filter(event => this.usedEvents.includes(onText(event)));
		for (const event of this.clientEvents)
			this.client.on(event, (...args) => this.runClientEvent(event, args));
	}

	registerTimedEvents() {
		this.timedEvents = Object.keys(intervals).filter(interval => this.usedEvents.includes(everyText(interval)));
		for (const event of this.timedEvents)
			setInterval(() => this.runTimedEvent(event, []), intervals[event] * 1000);
	}

	initialize(folder) {
		this.addServicesIn(folder);
		this.registerClientEvents();
		this.registerTimedEvents();
	}
};