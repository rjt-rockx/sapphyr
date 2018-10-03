var fs = require("fs");

let services = [];
fs.readdirSync(__dirname + "/").forEach(filename => {
	if (filename.match(/\.(js|json)$/) !== null && filename !== "index.js") {
		let name = filename.replace(new RegExp(/\.js$/, "g"), "");
		services.push(require("./" + name));
	}
});

let events = [
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
	"guildMemberAvailable",
	"guildMemberRemove",
	"guildMemberSpeaking",
	"guildMemberUpdate",
	"guildUnavailable",
	"guildUpdate",
	"message",
	"messageDelete",
	"messageDeleteBulk",
	"messageReactionAdd",
	"messageReactionRemove",
	"messageReactionRemoveAll",
	"messageUpdate",
	"presenceUpdate",
	"rateLimit",
	"roleCreate",
	"roleDelete",
	"roleUpdate",
	"typingStart",
	"typingStop",
	"userUpdate",
	"voiceStateUpdate",
	"webhookUpdate"
];

function callServiceEvent(event, args) {
	services.forEach(service => {
		if (typeof service.type === "undefined") return;
		if (typeof service.type === "string" && service.type !== "event") return;
		if (Array.isArray(service.type) && (service.type.includes("event") === false)) return;
		if (typeof service.on[event] !== "undefined")
			service.on[event](...args);
	});
}

exports.initializeServices = async client => await Promise.all(services.map(async service => {
	if (typeof service.initialize !== "undefined")
		await service.initialize(client);
	for (let event of events)
		client.on(event, (...args) => callServiceEvent(event, args));
}));

exports.services = services;