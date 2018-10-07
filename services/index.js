const fs = require("fs");

let services = [];
fs.readdirSync(__dirname + "/").forEach(filename => {
	if (filename.match(/\.js$/) !== null && filename !== "index.js") {
		let name = filename.replace(new RegExp(/\.js$/, "g"), "");
		services.push(require("./" + name));
	}
});

let events = {
	channelCreate: [],
	channelDelete: [],
	channelPinsUpdate: [],
	channelUpdate: [],
	emojiCreate: [],
	emojiDelete: [],
	emojiUpdate: [],
	guildBanAdd: [],
	guildBanRemove: [],
	guildCreate: [],
	guildDelete: [],
	guildIntegrationsUpdate: [],
	guildMemberAdd: [],
	guildMemberAvailable: [],
	guildMemberRemove: [],
	guildMemberSpeaking: [],
	guildMemberUpdate: [],
	guildUnavailable: [],
	guildUpdate: [],
	message: [],
	messageDelete: [],
	messageDeleteBulk: [],
	messageReactionAdd: [],
	messageReactionRemove: [],
	messageReactionRemoveAll: [],
	messageUpdate: [],
	presenceUpdate: [],
	roleCreate: [],
	roleDelete: [],
	roleUpdate: [],
	typingStart: [],
	typingStop: [],
	userUpdate: [],
	voiceStateUpdate: [],
	webhookUpdate: []
};
let eventList = Object.keys(events);

function isEventBased(service) {
	if (typeof service.type === "undefined") return false;
	if (typeof service.type === "string" && service.type !== "event") return false;
	if (Array.isArray(service.type) && (service.type.includes("event") === false)) return false;
	return true;
}

exports.initializeServices = async client => {
	await Promise.all(services.map(async service => {
		if (typeof service.initialize !== "undefined")
			await service.initialize(client);
		if (isEventBased(service) && typeof service.on === "object" && Object.keys(service.on).length > 0)
			for (let eventName of Object.keys(service.on))
				if (eventList.includes(eventName))
					events[eventName].push(service.on[eventName]);
	}));
	for (let eventName of eventList)
		client.on(eventName, (...args) => events[eventName].map(listener => listener(...args)));
};

exports.removeServices = () => eventList.map(eventName => events[eventName] = []);

exports.services = services;